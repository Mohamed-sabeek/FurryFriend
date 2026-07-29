require('dotenv').config();
const { getAllToolSchemas } = require('./services/AI/toolRegistry');
const { createChatCompletion } = require('./services/AI/groqClient');

async function run() {
  try {
    const tools = getAllToolSchemas();
    const result = await createChatCompletion({
      messages: [{ role: 'user', content: 'hello' }],
      tools,
      tool_choice: 'auto'
    });
    console.log("Success:", result);
  } catch (err) {
    console.error("Crash:", err);
  }
}
run();
