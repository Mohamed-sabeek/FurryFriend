const NutritionPlan = require('../models/NutritionPlan');
const HealthRecord = require('../models/HealthRecord');
const Vaccination = require('../models/Vaccination');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const WaterLog = require('../models/WaterLog');
const { createChatCompletion } = require('../services/AI/groqClient');

const calculateMaxUpdatedAt = (docsArray) => {
  if (!docsArray || docsArray.length === 0) return 0;
  return Math.max(...docsArray.map(doc => new Date(doc.updatedAt).getTime() || 0));
};

// ─── GET /api/nutrition/:petId/plan ───────────────────────────────────────
exports.getNutritionPlan = async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Fetch all related data
    const [pet, records, vaccinations, medications, appointments, latestPlan] = await Promise.all([
      Pet.findOne({ _id: petId, owner: req.user.id }),
      HealthRecord.find({ pet: petId }).sort({ visitDate: -1 }),
      Vaccination.find({ pet: petId }).sort({ vaccinatedDate: -1 }),
      Medication.find({ pet: petId }).sort({ startDate: -1 }),
      Appointment.find({ pet: petId }).sort({ date: -1 }),
      NutritionPlan.findOne({ pet: petId, user: req.user.id }).sort({ createdAt: -1 })
    ]);

    if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });

    const maxPetUpdate = new Date(pet.updatedAt).getTime() || 0;
    const maxRecordUpdate = calculateMaxUpdatedAt(records);
    const maxVaccineUpdate = calculateMaxUpdatedAt(vaccinations);
    const maxMedUpdate = calculateMaxUpdatedAt(medications);
    const maxApptUpdate = calculateMaxUpdatedAt(appointments);

    const lastDataVersionTime = Math.max(maxPetUpdate, maxRecordUpdate, maxVaccineUpdate, maxMedUpdate, maxApptUpdate);
    
    // Cache Check
    const isCacheValid = latestPlan && latestPlan.dataVersion && new Date(latestPlan.dataVersion).getTime() >= lastDataVersionTime;
    
    if (latestPlan) {
      if (isCacheValid) {
        console.log('Returning cached Nutrition Plan');
        return res.status(200).json({ success: true, data: latestPlan, cached: true, isStale: false });
      } else {
        console.log('Returning stale Nutrition Plan');
        return res.status(200).json({ success: true, data: latestPlan, cached: true, isStale: true });
      }
    }

    return res.status(404).json({ success: false, error: 'No nutrition plan found. Please generate one.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── POST /api/nutrition/:petId/generate ────────────────────────────────────
exports.generateNutritionPlan = async (req, res) => {
  try {
    const { petId } = req.params;
    const preferences = req.body.preferences || {};
    
    // Fetch all related data
    const [pet, records, vaccinations, medications, appointments, waterHistory] = await Promise.all([
      Pet.findOne({ _id: petId, owner: req.user.id }),
      HealthRecord.find({ pet: petId }).sort({ visitDate: -1 }),
      Vaccination.find({ pet: petId }).sort({ vaccinatedDate: -1 }),
      Medication.find({ pet: petId }).sort({ startDate: -1 }),
      Appointment.find({ pet: petId }).sort({ date: -1 }),
      WaterLog.find({ pet: petId }).sort({ dateString: -1 }).limit(7)
    ]);

    if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });

    const maxPetUpdate = new Date(pet.updatedAt).getTime() || 0;
    const maxRecordUpdate = calculateMaxUpdatedAt(records);
    const maxVaccineUpdate = calculateMaxUpdatedAt(vaccinations);
    const maxMedUpdate = calculateMaxUpdatedAt(medications);
    const maxApptUpdate = calculateMaxUpdatedAt(appointments);

    const lastDataVersionTime = Math.max(maxPetUpdate, maxRecordUpdate, maxVaccineUpdate, maxMedUpdate, maxApptUpdate);
    const lastDataVersionDate = new Date(lastDataVersionTime);

    const systemPrompt = `You are NutriPaws AI, an expert veterinary nutritionist AI agent.
Your task is to analyze the provided pet health data, including appointment history and water history to spot trends, and generate a highly personalized, structured JSON nutrition plan.

SAFETY CONSTRAINTS:
- Do not diagnose diseases.
- Do not prescribe medications.
- Generate nutritional guidance only.
- Recommend consulting a veterinarian for medical concerns.
- NEVER invent allergies, diseases, or medications. If the data does not specify an allergy, do not list one.
- Only base recommendations on the explicitly provided MongoDB data.

You MUST respond ONLY with a valid JSON object. Do not include markdown formatting or explanation text outside the JSON.

The JSON must follow this exact structure (replace values with your dynamic content based strictly on the provided data):
{
  "dailyCalories": {
    "target": 900,
    "current": 1100,
    "recommendation": "Provide specific recommendation based on actual weight trends."
  },
  "waterIntake": {
    "target": 1800,
    "recommendation": "Provide hydration advice based on actual water history."
  },
  "mealPlan": [
    { "name": "Breakfast", "time": "8:00 AM", "calories": 400, "food": "Appropriate food suggestion", "quantity": "1.5 cups" },
    { "name": "Dinner", "time": "7:00 PM", "calories": 500, "food": "Appropriate food suggestion", "quantity": "1.5 cups" }
  ],
  "weeklySchedule": {
    "Monday": { "Breakfast": "...", "Dinner": "..." },
    "Tuesday": { "Breakfast": "...", "Dinner": "..." }
  },
  "shoppingList": [
    { "item": "Example item based on meal plan", "category": "Produce" }
  ],
  "foodsToAvoid": ["List ONLY items based on ACTUAL allergies or standard toxic foods for this species"],
  "recommendedFoods": ["List appropriate foods"],
  "supplements": [
    { "name": "Example Supplement", "reason": "Reason strictly based on actual medical condition if any" }
  ],
  "smartAlerts": [
    "Alerts about actual trends from the data (e.g. low hydration, weight gain)"
  ],
  "aiReasoning": [
    "Explain exactly why you chose this plan based ONLY on the provided data."
  ]
}

Analyze the following data to generate the response:
User Preferences: ${JSON.stringify(preferences)}
Pet Profile: ${JSON.stringify(pet)}
Medical History: ${JSON.stringify(records)}
Medications: ${JSON.stringify(medications)}
Appointment History (Look for trends like weight gain): ${JSON.stringify(appointments)}
Water History (Last 7 days, check for adequate hydration): ${JSON.stringify(waterHistory)}
`;

    let aiResponse;
    try {
      const chatResponse = await createChatCompletion({
        messages: [{ role: 'system', content: systemPrompt }],
        temperature: 0.3
      });
      
      try {
        aiResponse = JSON.parse(chatResponse.content);
      } catch (e) {
        const jsonMatch = chatResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON from AI');
        }
      }

      // Create new NutritionPlan record
      const nutritionPlan = await NutritionPlan.create({
        user: req.user.id,
        pet: pet._id,
        planData: aiResponse,
        aiReasoning: aiResponse.aiReasoning || [],
        preferences: preferences,
        dataVersion: lastDataVersionDate
      });

      res.status(200).json({ success: true, data: nutritionPlan });
    } catch (groqError) {
      console.error('Groq Generation Failed:', groqError.message);
      res.status(500).json({ success: false, error: 'Failed to generate nutrition plan.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
