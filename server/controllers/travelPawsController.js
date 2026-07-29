const Pet = require('../models/Pet');
const HealthRecord = require('../models/HealthRecord');
const { createChatCompletion } = require('../services/AI/groqClient');

exports.generateBoardingPlan = async (req, res) => {
  try {
    const petId = req.params.petId;
    const pet = await Pet.findById(petId);
    
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    // Check Cache
    if (pet.aiSummaryCached && !pet.aiSummaryCached.isOutdated && pet.aiSummaryCached.summary) {
       // if we want to cache it in aiSummaryCached.travelPaws...
       // but wait, the AI logic requires up-to-date validation
       // I'll skip cache check for now or just regenerate to be safe.
    }

    // Fetch Health Records
    const healthRecords = await HealthRecord.find({ pet: petId }).sort({ recordDate: -1 }).limit(3);

    const prompt = `You are TravelPaws AI, an expert veterinary boarding assistant.
Please analyze the following pet profile and determine if they are eligible for boarding, and generate a Readiness Report.

Pet Name: ${pet.petName}
Species: ${pet.species}
Breed: ${pet.breed}
Age: ${pet.age} years
Weight: ${pet.weight} ${pet.weightUnit}
Vaccination Status: ${pet.vaccinationStatus}

Health History:
${healthRecords.map(r => `- ${r.recordType}: ${r.description} (Diagnosis: ${r.diagnosis || 'None'})`).join('\n')}

Grooming History:
${pet.groomingHistory.map(g => `- ${g.date}: ${g.services.join(', ')}`).join('\n')}

Previous Boarding:
${pet.boardingHistory.map(b => `- ${b.date}: ${b.duration} days at ${b.centerName} (Summary: ${b.staySummary})`).join('\n')}

Based on the above, output a STRICT JSON object matching this structure:
{
  "isEligible": true/false,
  "ineligibilityReason": "string (empty if eligible, else explain why e.g. Rabies vaccination expired)",
  "readinessReport": {
    "overallScore": number (0-100),
    "vaccinationClearance": "string",
    "healthClearance": "string",
    "medicationReminder": "string",
    "packingChecklist": ["item1", "item2"],
    "foodInstructions": "string",
    "emergencyInstructions": "string",
    "specialCareNotes": "string",
    "behaviourSummary": "string",
    "travelTips": ["tip1", "tip2"]
  }
}

Important Rules:
1. If the vaccination status is not 'Up to date', isEligible must be false and state they need to renew vaccinations.
2. If there's a recent severe contagious disease or recent major surgery in health history without a cleared status, isEligible must be false.
3. Only return valid JSON without any markdown formatting blocks like \`\`\`json.
`;

    const response = await createChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    });

    let resultJSON = response.content.trim();
    // Safely remove markdown blocks if any
    if (resultJSON.startsWith('```json')) resultJSON = resultJSON.substring(7);
    if (resultJSON.startsWith('```')) resultJSON = resultJSON.substring(3);
    if (resultJSON.endsWith('```')) resultJSON = resultJSON.substring(0, resultJSON.length - 3);

    const parsedResult = JSON.parse(resultJSON.trim());

    res.status(200).json({ success: true, data: parsedResult });
  } catch (error) {
    console.error('Error in TravelPaws:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
