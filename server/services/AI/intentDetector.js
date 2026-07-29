const { createChatCompletion } = require('./groqClient');

/**
 * Lightweight classification step to determine user intent before main processing.
 * This helps in pre-selecting tools or routing the query to specialized sub-agents.
 */
const detectIntent = async (userMessage) => {
  const prompt = `Classify the following user message into one of these strict intents:
- book_appointment
- search_hospital
- symptom_check
- emergency
- nutrition
- travel
- shopping
- general_question

Reply ONLY with the exact string of the intent. Do not include quotes, periods, or explanations.

User Message: "${userMessage}"`;

  try {
    const response = await createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1 // Low temperature for deterministic classification
    });
    
    const intent = response.content.trim().toLowerCase();
    console.log(`Detected Intent: ${intent}`);
    return intent;
  } catch (error) {
    console.error('Intent Detection failed:', error);
    return 'general_question'; // Fallback
  }
};

module.exports = {
  detectIntent
};
