const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['system', 'user', 'assistant', 'tool'],
    required: true
  },
  content: { type: String, default: '' },
  name: { type: String },           // tool name
  tool_call_id: { type: String },
  tool_calls: { type: Array },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // agentType supports future agents: vetconnect, nutrition, grooming, marketplace, travel, health
  agentType: {
    type: String,
    default: 'vetconnect',
    index: true
  },
  // Legacy field kept for backward compat
  agent: { type: String, default: 'vet' },

  title: { type: String, default: 'New Chat' },
  messages: [messageSchema]
}, {
  timestamps: true
});

// Compound index: one user can have many conversations
conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
