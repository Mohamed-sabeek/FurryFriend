const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

module.exports = router;
