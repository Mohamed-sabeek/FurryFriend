const express = require('express');
const router = express.Router();
const {
  chat,
  newConversation,
  getConversations,
  getConversation,
  removeConversation,
  updateConversation,
  getHistory,
  clearHistory,
  generateHealthSummary
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Chat
router.post('/chat', chat);

// AI Health Summary endpoint
router.get('/health-summary/:petId', generateHealthSummary);

// Conversation CRUD
router.post('/conversations', newConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversation);
router.delete('/conversations/:id', removeConversation);
router.patch('/conversations/:id', updateConversation);

// Legacy
router.get('/history', getHistory);
router.delete('/history', clearHistory);

module.exports = router;
