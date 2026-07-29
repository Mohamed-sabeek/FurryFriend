require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./models/User');
    const user = await User.findOne();
    if (!user) return console.log("No user found");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log("Token:", token);

    // Make a request to the local server
    const axios = require('axios');
    try {
      const res = await axios.post('http://localhost:5000/api/ai/chat', {
        message: 'General Checkup',
        conversationId: null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Response:", res.data);
    } catch (e) {
      console.error("API Error status:", e.response?.status);
      console.error("API Error data:", e.response?.data);
    }
  } catch (err) {
    console.error("Crash:", err);
  } finally {
    mongoose.disconnect();
  }
}
run();
