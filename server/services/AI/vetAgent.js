const { createChatCompletion, streamChatCompletion } = require('./groqClient');
const { buildVetAgentPrompt } = require('./promptBuilder');
const { 
  getConversation, 
  appendMessages, 
  setConversationTitle 
} = require('./conversationManager');
const { detectIntent } = require('./intentDetector');
const { getAllToolSchemas } = require('./toolRegistry');
const { executeTools } = require('./toolExecutor');
const User = require('../../models/User');
const Conversation = require('../../models/Conversation');
const Pet = require('../../models/Pet');
const Appointment = require('../../models/Appointment');

const sanitiseMessage = (msg) => {
  const clean = {
    role: msg.role
  };
  
  // Always ensure content is at least an empty string to prevent Groq API 400 errors on some models
  clean.content = msg.content || '';

  if (msg.name)         clean.name = msg.name;
  if (msg.tool_call_id) clean.tool_call_id = msg.tool_call_id;
  if (msg.tool_calls && Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0) {
    clean.tool_calls = msg.tool_calls;
  }
  
  // Truncate large tool responses in history to prevent hitting Groq's TPM limits
  if (msg.role === 'tool' && clean.content.length > 500) {
    clean.content = clean.content.substring(0, 300) + '... [Content truncated for token limit]';
  }
  
  return clean;
};

const TERMINAL_TOOLS = new Set([
  'searchNearbyHospitals',
  'checkUpcomingAppointments',
  'cancelAppointment'
]);

const processMessage = async (userId, userMessage, location = {}, conversationId = null) => {
  // 1. Parallelize all initial backend data fetches
  const [user, intent, conversation, pets, appointments] = await Promise.all([
    User.findById(userId).lean().select('name email'),
    detectIntent(userMessage).catch(() => 'general'),
    getConversation(userId, 'vet', conversationId),
    Pet.find({ owner: userId }).lean(),
    Appointment.find({ user: userId }).populate('pet', 'petName species breed age vaccinationStatus').sort({ date: -1 }).limit(5).lean()
  ]);

  if (!user) throw new Error('User not found');
  const userDetails = { name: user.name, email: user.email };

  const systemPrompt = buildVetAgentPrompt(userDetails, location, pets, appointments);

  const isFirstMessage = conversation.messages.filter(m => m.role === 'user').length === 0;

  // Send only last 10 messages to Groq (keep costs down, reduce latency)
  const historyMessages = conversation.messages
    .slice(-10) // Reduced from 20 to 10 for speed
    .map(sanitiseMessage)
    .filter(m => m.role !== 'system')
    .reduce((acc, msg) => {
      if (msg.role === 'tool' && !acc.some(m => m.role === 'assistant' && m.tool_calls)) {
        return acc;
      }
      acc.push(msg);
      return acc;
    }, []);

  const tools = getAllToolSchemas();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: userMessage }
  ];

  console.log('🤖 Calling Groq (turn 1)...');
  let responseMessage = await createChatCompletion({ messages, tools, tool_choice: 'auto' });
  console.log('📨 Turn 1:', responseMessage.tool_calls ? `tool_calls: ${responseMessage.tool_calls.map(t=>t.function.name)}` : 'text response');

  const newMessagesToSave = [
    { role: 'user', content: userMessage },
    responseMessage
  ];

  // Agentic loop — keep calling tools until a TERMINAL tool fires or AI stops calling tools
  let loopCount = 0;
  let terminalToolFired = false;

  while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0 && loopCount < 8) {
    loopCount++;
    const toolNames = responseMessage.tool_calls.map(t => t.function.name);
    console.log(`🔧 Loop #${loopCount} — tools: [${toolNames}]`);

    // Check if any terminal tool is being called in this batch
    const isTerminal = toolNames.some(name => TERMINAL_TOOLS.has(name));

    // Append assistant's tool-call decision to thread
    messages.push(sanitiseMessage(responseMessage));

    // Execute all tools
    const toolResults = await executeTools(responseMessage.tool_calls, userId, conversationId);
    for (const result of toolResults) {
      messages.push(result);
      newMessagesToSave.push(result);
    }

    if (isTerminal) {
      terminalToolFired = true;
      // FAST PATH: Skip the second LLM call entirely to save 1-2 seconds of latency!
      // We know what the terminal tool did, so we can generate a natural response instantly.
      console.log('⚡ Skipping final Groq call for speed. Generating instant response.');
      const lastToolResult = newMessagesToSave[newMessagesToSave.length - 1];
      let fastContent = 'Action completed successfully.';
      
      try {
         const parsed = JSON.parse(lastToolResult.content);
         if (parsed.message) {
             fastContent = parsed.message;
             
             // Add some natural flair for specific actions
             if (toolNames.includes('searchNearbyHospitals') || toolNames.includes('findEmergencyHospital')) {
                 if (parsed.hospitals && parsed.hospitals.length > 0) {
                     fastContent = `I found ${parsed.hospitals.length} veterinary clinics near you. I've displayed them on the map below! You can click "Directions" to see the route, or "Book" to schedule an appointment.`;
                 }
             } else if (toolNames.includes('checkUpcomingAppointments')) {
                 if (parsed.appointments && parsed.appointments.length > 0) {
                     fastContent = `You have ${parsed.appointments.length} upcoming appointment(s). I've listed them for you above.`;
                 }
             }
         }
      } catch (e) {
          fastContent = lastToolResult.content;
      }

      responseMessage = {
          role: 'assistant',
          content: fastContent
      };
      
      newMessagesToSave.push(responseMessage);
      break;
    } else {
      // Non-terminal tool (e.g. getRegisteredPets) — continue the loop with tools enabled
      console.log('🤖 Calling Groq (continue loop with tools)...');
      responseMessage = await createChatCompletion({
        messages,
        tools,
        tool_choice: 'auto',
        temperature: 0.2
      });
      newMessagesToSave.push(responseMessage);
    }
  }

  // 8. Fire and forget: Save all new messages to conversation history in the background
  const convIdToUse = conversationId || conversation._id.toString();
  
  // Do not await this! Let it persist in the background to shave ~50-100ms off response latency
  appendMessages(userId, 'vet', newMessagesToSave, convIdToUse).catch(err => {
    console.error('Failed to persist background messages:', err);
  });

  // Auto-generate title after first user message (also background)
  if (isFirstMessage) {
    setConversationTitle(convIdToUse, userId, userMessage).catch(() => {});
  }

  const toolsFired = newMessagesToSave
    .filter(msg => msg.role === 'tool')
    .map(msg => ({ name: msg.name, content: msg.content }));

  console.log('📤 Tools fired:', toolsFired.map(t => t.name));
  console.log('📤 Final response length:', responseMessage.content?.length);

  return {
    content: responseMessage.content || '',
    intent,
    toolsFired
  };
};

const processMessageFast = async (userId, userMessage, context, conversationId, onStreamToken, onToolStart) => {
  const { user, pets, appointments, conversation, location, bookingSession } = context;

  const systemPrompt = buildVetAgentPrompt(user, location, pets, appointments, bookingSession);
  const isFirstMessage = conversation.messages.filter(m => m.role === 'user').length === 0;

  // Reduce context to strictly 5 messages to save tokens and speed up TTFT
  const historyMessages = conversation.messages
    .slice(-5)
    .map(sanitiseMessage)
    .filter(m => m.role !== 'system')
    .reduce((acc, msg) => {
      if (msg.role === 'tool' && !acc.some(m => m.role === 'assistant' && m.tool_calls)) {
        return acc;
      }
      acc.push(msg);
      return acc;
    }, []);

  const tools = getAllToolSchemas();
  const messages = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: userMessage }
  ];

  console.log('🤖 Calling Groq (turn 1 fast streaming)...');
  
  let responseMessage = { role: 'assistant', content: '' };
  
  // Create stream
  const stream = await streamChatCompletion({ messages, tools, tool_choice: 'auto' });
  
  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      responseMessage.content += chunk.token;
      if (onStreamToken) onStreamToken(chunk.token);
    } else if (chunk.type === 'done') {
      responseMessage = chunk.message;
    }
  }

  console.log('📨 Turn 1:', responseMessage.tool_calls ? `tool_calls: ${responseMessage.tool_calls.map(t=>t.function.name)}` : 'text response');

  const newMessagesToSave = [
    { role: 'user', content: userMessage },
    responseMessage
  ];

  let loopCount = 0;
  let terminalToolFired = false;

  while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0 && loopCount < 8) {
    loopCount++;
    const toolNames = responseMessage.tool_calls.map(t => t.function.name);
    console.log(`🔧 Loop #${loopCount} — tools: [${toolNames}]`);

    if (onToolStart) {
      toolNames.forEach(t => onToolStart(t));
    }

    const isTerminal = toolNames.some(name => TERMINAL_TOOLS.has(name));
    messages.push(sanitiseMessage(responseMessage));

    // For fast path: If it's a search, we can run it in parallel, but right now we just execute and return fast content.
    // However, if we don't wait for search, we need a different approach. The user prompt says:
    // "Change it to: User -> Groq -> Reply immediately -> Geoapify runs in parallel -> Update UI when hospitals arrive"
    // To do this, we can return the tool calls themselves to the UI via SSE, and execute them in the background.

    if (isTerminal) {
      terminalToolFired = true;
      console.log('⚡ Terminal tool detected. Running in background and returning fast response.');
      
      // Fast fake content based on the tool
      let fastContent = "I'm processing that for you right now...";
      if (toolNames.includes('searchNearbyHospitals') || toolNames.includes('findEmergencyHospital')) {
        fastContent = "I'm searching for veterinary hospitals near you right now. They will appear on the map shortly.";
      } else if (toolNames.includes('bookAppointment')) {
        fastContent = "I'm booking your appointment. Please wait a moment while I confirm the details.";
      } else if (toolNames.includes('checkUpcomingAppointments')) {
        fastContent = "I'm checking your upcoming appointments...";
      }

      if (onStreamToken) onStreamToken("\n\n" + fastContent);
      
      const originalToolCalls = responseMessage.tool_calls;
      responseMessage = { role: 'assistant', content: fastContent, tool_calls: originalToolCalls };
      newMessagesToSave.push(responseMessage);
      
      // If we want the UI to update when hospitals arrive, we MUST keep the connection open!
      // So we DO await the tools, but we ALREADY streamed the fast text!
      const toolResults = await executeTools(originalToolCalls, userId, conversationId);
      for (const result of toolResults) {
        messages.push(result);
        newMessagesToSave.push(result);
      }

      // No second LLM call! We just return. The frontend will receive the toolResults 
      // in the final payload and update the map immediately.
      break;
    } else {
      // Execute non-terminal tools synchronously
      const toolResults = await executeTools(responseMessage.tool_calls, userId, conversationId);
      for (const result of toolResults) {
        messages.push(result);
        newMessagesToSave.push(result);
      }
      
      console.log('🤖 Calling Groq (continue loop with tools)...');
      for (let i = 0; i < messages.length; i++) {
        if (typeof messages[i] !== 'object' || messages[i] === null || !messages[i].role) {
          console.error(`🚨 FATAL: messages[${i}] is invalid or missing role!`, messages[i]);
        }
      }
      const nextStream = await streamChatCompletion({ messages, tools, tool_choice: 'auto' });
      responseMessage = { role: 'assistant', content: '' };
      
      for await (const chunk of nextStream) {
        if (chunk.type === 'content') {
          responseMessage.content += chunk.token;
          if (onStreamToken) onStreamToken(chunk.token);
        } else if (chunk.type === 'done') {
          responseMessage = chunk.message;
        }
      }
      newMessagesToSave.push(responseMessage);
    }
  }

  // Background persist
  const convIdToUse = conversationId || conversation._id.toString();
  appendMessages(userId, 'vet', newMessagesToSave, convIdToUse).catch(err => {
    console.error('Failed to persist background messages:', err);
  });

  if (isFirstMessage) {
    setConversationTitle(convIdToUse, userId, userMessage).catch(() => {});
  }

  const toolsFired = newMessagesToSave
    .filter(msg => msg.role === 'tool')
    .map(msg => ({ name: msg.name, content: msg.content }));

  // Run intent detector asynchronously as well if needed, we just mock it for now
  const intent = 'general'; 

  return {
    content: responseMessage.content || '',
    intent,
    toolsFired
  };
};

module.exports = { processMessage, processMessageFast };
