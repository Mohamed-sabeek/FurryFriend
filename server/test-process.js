require('dotenv').config();
const mongoose = require('mongoose');
const vetAgent = require('./services/AI/vetAgent');
const User = require('./models/User'); 

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await mongoose.model('User').findOne();
    if (!user) return console.log("No user found");
    
    console.log("Testing processMessageFast with 'I need a vet appointment'...");
    const context = {
      user: { name: user.name, email: user.email },
      pets: [],
      appointments: [],
      conversation: { _id: 'mock_conv_id', messages: [] },
      location: {}
    };

    const result = await vetAgent.processMessageFast(
      user._id, 
      "I need a vet appointment", 
      context, 
      null,
      (token) => process.stdout.write(token),
      (tool) => console.log(`\n[TOOL] ${tool}\n`)
    );
    console.log("\n\nSuccess:", result);
  } catch (err) {
    console.error("Crash:", err);
  } finally {
    mongoose.disconnect();
  }
}
run();
