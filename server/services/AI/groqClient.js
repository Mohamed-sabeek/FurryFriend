const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'MISSING_API_KEY',
});

// Model fallback chain — try in order until one succeeds
// llama-3.1-8b-instant has a much higher daily token limit than llama-3.3-70b-versatile
const MODEL_CHAIN = [
  'llama-3.1-8b-instant',        // Primary: high TPD, fast
  'llama3-8b-8192',              // Fallback 1: older 8b model
  'gemma2-9b-it',                // Fallback 2: Google Gemma
  'llama-3.3-70b-versatile',     // Fallback 3: high quality but lower TPD
];

/**
 * Call Groq Chat Completions.
 * @param {object} opts
 * @param {Array}  opts.messages
 * @param {Array}  [opts.tools]        - Pass tools only when you want the LLM to potentially call them.
 * @param {string} [opts.tool_choice]  - 'auto' | 'required' | 'none'
 * @param {number} [opts.temperature]  - Low temp (0.1) for reliable tool calling
 */
async function createChatCompletion({
  messages,
  tools = [],
  tool_choice = 'auto',
  model = null,           // null = use fallback chain
  temperature = 0.2,
  response_format = null
}) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'MISSING_API_KEY') {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  if (!messages || messages.length === 0) {
    throw new Error('Messages array is empty — cannot call Groq.');
  }

  const payload = { messages, temperature };

  // Only attach tools/tool_choice when there are actual tools.
  // Passing tool_choice:'none' with an empty tools array crashes Groq with a 400/500.
  if (tools && tools.length > 0) {
    payload.tools = tools;
    payload.tool_choice = tool_choice;
  }
  if (response_format) {
    payload.response_format = response_format;
  }
  // If tools is empty, omit both tools and tool_choice entirely (text-only turn).

  // Try each model in the fallback chain
  const modelsToTry = model ? [model] : MODEL_CHAIN;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const chatCompletion = await groq.chat.completions.create({ ...payload, model: modelName });
      const message = chatCompletion.choices[0].message;

      // Normalise: Groq sometimes returns content=null for tool_call messages.
      if (message.content === null || message.content === undefined) {
        message.content = '';
      }

      return message;
    } catch (err) {
      const is429 = err.status === 429 || err.message?.includes('rate_limit') || err.message?.includes('Rate limit');
      const isModelErr = err.status === 400 && (err.message?.includes('model') || err.message?.includes('tool_use_failed') || err.message?.includes('failed_generation') || err.message?.includes('Failed to call a function'));

      if (is429 || isModelErr) {
        console.warn(`⚠️  Model ${modelName} unavailable or failed tool call (${err.status || 'err'}), trying next...`);
        lastError = err;
        continue; // try next model
      }

      // Non-rate-limit error — throw immediately
      throw err;
    }
  }

  // All models exhausted
  const rateLimitMsg = lastError?.message?.match(/try again in (\S+)/i)?.[1];
  throw new Error(
    rateLimitMsg
      ? `All AI models are currently rate-limited. Please try again in ${rateLimitMsg}.`
      : 'All AI models are currently unavailable. Please try again in a few minutes.'
  );
}

/**
 * Call Groq Chat Completions with Streaming.
 */
async function* streamChatCompletion({
  messages,
  tools = [],
  tool_choice = 'auto',
  model = null,
  temperature = 0.2
}) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'MISSING_API_KEY') {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const payload = { messages, temperature, stream: true };

  if (tools && tools.length > 0) {
    payload.tools = tools;
    payload.tool_choice = tool_choice;
  }

  const modelsToTry = model ? [model] : MODEL_CHAIN;
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const stream = await groq.chat.completions.create({ ...payload, model: modelName });
      
      let fullContent = '';
      let toolCallsData = null;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          fullContent += delta.content;
          yield { type: 'content', token: delta.content };
        }
        
        // Handle tool calls in stream
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const index = tc.index;
            if (!toolCallsData) toolCallsData = [];
            if (!toolCallsData[index]) {
              toolCallsData[index] = {
                id: tc.id || '',
                type: 'function',
                function: { name: tc.function?.name || '', arguments: '' }
              };
            } else {
              if (tc.id) toolCallsData[index].id += tc.id;
              if (tc.function?.name) toolCallsData[index].function.name += tc.function.name;
            }
            
            if (tc.function?.arguments) {
              toolCallsData[index].function.arguments += tc.function.arguments;
            }
          }
        }
      }

      // Filter out any potential nulls from sparse arrays
      if (toolCallsData) {
        toolCallsData = toolCallsData.filter(Boolean);
      }

      yield { type: 'done', message: { role: 'assistant', content: fullContent, tool_calls: toolCallsData } };
      return; // Success
    } catch (err) {
      const is429 = err.status === 429 || err.message?.includes('rate_limit') || err.message?.includes('Rate limit');
      const isModelErr = err.status === 400 && (err.message?.includes('model') || err.message?.includes('tool_use_failed') || err.message?.includes('failed_generation') || err.message?.includes('Failed to call a function'));

      if (is429 || isModelErr) {
        console.warn(`⚠️  Model ${modelName} unavailable or failed stream (${err.status || 'err'}), trying next...`);
        lastError = err;
        continue;
      }
      console.error('Groq API Error:', err);
      throw err;
    }
  }

  console.error('Groq API Exhausted all models. Last Error:', lastError);
  throw lastError || new Error('All AI models are currently unavailable.');
}

module.exports = { createChatCompletion, streamChatCompletion };
