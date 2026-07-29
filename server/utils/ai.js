const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
// Note: Requires GEMINI_API_KEY in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key_if_missing');

/**
 * Generates an AI summary for a pet based on their profile data.
 * @param {Object} petData The pet's data
 * @returns {Promise<String>} The generated summary
 */
const generatePetSummary = async (petData) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Generating a fallback summary.');
      return `Welcome ${petData.petName}! Please add a Gemini API Key to generate a full AI summary.`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert AI veterinarian assistant for the "FurryFriend" app.
      Please write a friendly, concise, 2-4 sentence summary of the following pet based on their profile.
      Mention their name, age, breed/species, weight, and general health/lifestyle status.
      Offer a quick AI recommendation based on the data.
      
      Pet Data:
      Name: ${petData.petName}
      Species: ${petData.species}
      Breed: ${petData.breed || 'Unknown'}
      Gender: ${petData.gender}
      Weight: ${petData.weight || 'Unknown'} ${petData.weightUnit}
      Vaccination Status: ${petData.vaccinationStatus}
      Living Style: ${petData.livingStyle || 'Unknown'}
      Diet: ${petData.diet || petData.foodType || 'Unknown'}
      Allergies: ${petData.allergies?.join(', ') || 'None reported'}
      Conditions: ${petData.medicalConditions || 'None reported'}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI Summary Generation Error:', error);
    return 'Unable to generate AI summary at this time.';
  }
};

module.exports = { generatePetSummary };
