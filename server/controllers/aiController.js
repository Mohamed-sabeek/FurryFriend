const vetAgent = require('../services/AI/vetAgent');
const { handleChatRequest } = require('../services/aiOrchestrator');
const {
  createConversation,
  listConversations,
  getConversationById,
  deleteConversation,
  renameConversation
} = require('../services/AI/conversationManager');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');

// ─── POST /api/ai/chat ────────────────────────────────────────────────────────
const chat = async (req, res) => {
  return handleChatRequest(req, res);
};


// ─── POST /api/ai/conversations ── Create new conversation ───────────────────
const newConversation = async (req, res) => {
  try {
    const conv = await createConversation(req.user.id, 'vetconnect');
    res.status(201).json({ success: true, data: { id: conv._id, title: conv.title } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/ai/conversations ── List all conversations ─────────────────────
const getConversations = async (req, res) => {
  try {
    const list = await listConversations(req.user.id, 'vetconnect');
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/ai/conversations/:id ── Load a specific conversation ────────────
const getConversation = async (req, res) => {
  try {
    const conv = await getConversationById(req.params.id, req.user.id);
    // Return raw messages so the frontend can map tools to UI components (e.g., clinic cards, booking cards)
    const rawMessages = conv.messages;
    
    const bookingSession = await mongoose.model('BookingSession').findOne({ conversationId: conv._id }).lean();
    const bookingState = bookingSession ? bookingSession.state : null;

    res.status(200).json({
      success: true,
      data: {
        id: conv._id,
        title: conv.title,
        messages: rawMessages,
        updatedAt: conv.updatedAt,
        bookingState
      }
    });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// ─── DELETE /api/ai/conversations/:id ────────────────────────────────────────
const removeConversation = async (req, res) => {
  try {
    await deleteConversation(req.params.id, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── PATCH /api/ai/conversations/:id ── Rename ────────────────────────────────
const updateConversation = async (req, res) => {
  try {
    const { title } = req.body;
    await renameConversation(req.params.id, req.user.id, title);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── Legacy: GET /api/ai/history ─────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ user: req.user.id, agent: 'vet' })
      .sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: conversation ? conversation.messages : []
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch conversation history' });
  }
};

// ─── Legacy: DELETE /api/ai/history ──────────────────────────────────────────
const clearHistory = async (req, res) => {
  try {
    await Conversation.deleteMany({ user: req.user.id });
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to clear conversation history' });
  }
};

const HealthRecord = require('../models/HealthRecord');
const Vaccination = require('../models/Vaccination');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const { createChatCompletion } = require('../services/AI/groqClient');

// ─── GET /api/ai/health-summary/:petId ───────────────────────────────────────
const generateHealthSummary = async (req, res) => {
  try {
    const { petId } = req.params;
    const forceRegenerate = req.query.force === 'true';
    
    const HealthSummaryService = require('../services/HealthSummaryService');
    const result = await HealthSummaryService.generateReport(petId, req.user.id, forceRegenerate);
    
    res.status(200).json({ 
      success: true, 
      data: result.data, 
      cached: result.cached, 
      isOutdated: result.isOutdated 
    });
  } catch (error) {
    console.error('Health Summary Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  chat,
  newConversation,
  getConversations,
  getConversation,
  removeConversation,
  updateConversation,
  getHistory,
  clearHistory,
  generateHealthSummary
};
