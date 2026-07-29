const Conversation = require('../../models/Conversation');
const { createChatCompletion } = require('./groqClient');

// ─── GET or LOAD a specific conversation by ID ────────────────────────────────
const getConversationById = async (conversationId, userId) => {
  const conv = await Conversation.findOne({ _id: conversationId, user: userId }).lean();
  if (!conv) throw new Error('Conversation not found');
  return conv;
};

// ─── GET active conversation (latest) OR create if none ──────────────────────
const getConversation = async (userId, agentType = 'vet', conversationId = null) => {
  if (conversationId) {
    return getConversationById(conversationId, userId);
  }

  // Legacy: find by user+agent
  let conversation = await Conversation.findOne({ user: userId, agent: agentType })
    .sort({ updatedAt: -1 })
    .lean();

  if (!conversation) {
    conversation = await Conversation.create({
      user: userId,
      agent: agentType,
      agentType: 'vetconnect',
      messages: []
    });
  }
  return conversation;
};

// ─── CREATE a brand-new conversation ─────────────────────────────────────────
const createConversation = async (userId, agentType = 'vetconnect') => {
  const conv = await Conversation.create({
    user: userId,
    agent: 'vet',
    agentType,
    title: 'New Chat',
    messages: []
  });
  return conv.toObject();
};

// ─── APPEND messages to a conversation ───────────────────────────────────────
const appendMessages = async (userId, agentType, newMessages, conversationId = null) => {
  const formattedMessages = newMessages.map(msg => {
    const formatted = { role: msg.role, content: msg.content ?? '' };
    if (msg.name)         formatted.name = msg.name;
    if (msg.tool_call_id) formatted.tool_call_id = msg.tool_call_id;
    if (msg.tool_calls)   formatted.tool_calls = msg.tool_calls;
    return formatted;
  });

  let filter = conversationId 
    ? { _id: conversationId, user: userId }
    : { user: userId, agent: agentType };
  
  let sort = conversationId ? {} : { updatedAt: -1 };

  const updatedConv = await Conversation.findOneAndUpdate(
    filter,
    { $push: { messages: { $each: formattedMessages } } },
    { new: true, sort, lean: true }
  );

  return updatedConv;
};

// ─── AUTO-GENERATE a title from the first user message ───────────────────────
const generateTitle = async (userMessage) => {
  try {
    const response = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Generate a concise chat title (max 30 chars, no quotes) for a veterinary AI conversation based on the user message. Examples: "Luna Checkup", "Vaccination Reminder", "Vomiting Symptoms", "Nearby Hospitals", "Emergency Visit". Reply with ONLY the title, nothing else.'
        },
        { role: 'user', content: userMessage }
      ],
      tools: [],
      temperature: 0.3
    });
    const title = (response.content || 'New Chat').trim().slice(0, 30);
    return title;
  } catch {
    return userMessage.slice(0, 30);
  }
};

// ─── SET title on a conversation (called after first user message) ───────────
const setConversationTitle = async (conversationId, userId, userMessage) => {
  const title = await generateTitle(userMessage);
  await Conversation.findOneAndUpdate(
    { _id: conversationId, user: userId },
    { title }
  );
  return title;
};

// ─── LIST all conversations for a user ───────────────────────────────────────
const listConversations = async (userId, agentType = 'vetconnect') => {
  const convs = await Conversation.find({ user: userId, agentType })
    .sort({ updatedAt: -1 })
    .select('_id title updatedAt createdAt messages')
    .lean();

  return convs.map(c => ({
    id: c._id,
    title: c.title || 'New Chat',
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
    messageCount: c.messages?.length || 0,
    preview: c.messages?.filter(m => m.role === 'user').pop()?.content?.slice(0, 60) || ''
  }));
};

// ─── DELETE a conversation ────────────────────────────────────────────────────
const deleteConversation = async (conversationId, userId) => {
  await Conversation.findOneAndDelete({ _id: conversationId, user: userId });
};

// ─── RENAME a conversation ────────────────────────────────────────────────────
const renameConversation = async (conversationId, userId, title) => {
  await Conversation.findOneAndUpdate(
    { _id: conversationId, user: userId },
    { title: title.slice(0, 30) }
  );
};

module.exports = {
  getConversation,
  getConversationById,
  createConversation,
  appendMessages,
  listConversations,
  deleteConversation,
  renameConversation,
  setConversationTitle,
  generateTitle
};
