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
    const maxHealthAIUpdate = pet.aiSummaryCached?.generatedAt ? new Date(pet.aiSummaryCached.generatedAt).getTime() : 0;
    const maxRecordUpdate = calculateMaxUpdatedAt(records);
    const maxVaccineUpdate = calculateMaxUpdatedAt(vaccinations);
    const maxMedUpdate = calculateMaxUpdatedAt(medications);
    const maxApptUpdate = calculateMaxUpdatedAt(appointments);

    const lastDataVersionTime = Math.max(maxPetUpdate, maxHealthAIUpdate, maxRecordUpdate, maxVaccineUpdate, maxMedUpdate, maxApptUpdate);
    
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
    const maxHealthAIUpdate = pet.aiSummaryCached?.generatedAt ? new Date(pet.aiSummaryCached.generatedAt).getTime() : 0;
    const maxRecordUpdate = calculateMaxUpdatedAt(records);
    const maxVaccineUpdate = calculateMaxUpdatedAt(vaccinations);
    const maxMedUpdate = calculateMaxUpdatedAt(medications);
    const maxApptUpdate = calculateMaxUpdatedAt(appointments);

    const lastDataVersionTime = Math.max(maxPetUpdate, maxHealthAIUpdate, maxRecordUpdate, maxVaccineUpdate, maxMedUpdate, maxApptUpdate);
    const lastDataVersionDate = new Date(lastDataVersionTime);

    const systemPrompt = `You are a certified veterinary nutrition specialist.
Your task is to create a personalized, production-level nutrition plan based on the pet's complete medical history, latest doctor consultation, and PetHealth AI analysis.

CRITICAL MEDICAL CONSTRAINTS:
- You MUST respect the doctor's diagnosis. If the doctor prescribed a specific diet, follow it strictly.
- Adapt the diet for any diagnosed conditions (e.g., Obesity, Kidney Disease, Diabetes, Allergies).
- Read every prescribed medicine and identify any food interactions or restrictions.
- Never invent diseases or allergies. Rely only on the provided MongoDB data.
- Do not ask the user for information. Everything you need is below.

You MUST respond ONLY with a valid JSON object. Do not include markdown formatting or explanation text outside the JSON.

The JSON must follow this exact structure (replace values with your dynamic content based strictly on the data):
{
  "petSummary": "Brief overview based on age, breed, weight, and general health",
  "nutritionScore": 85,
  "currentNutritionStatus": "Detailed explanation of current nutrition status",
  "targetNutritionGoal": "Specific target goal (e.g., lose 2kg, support joints)",
  "dailyCalories": { 
    "target": 900, 
    "recommendation": "Provide specific recommendation based on actual weight trends" 
  },
  "macronutrients": {
    "protein": "e.g. 25% - High quality protein for muscle maintenance",
    "fat": "e.g. 15% - Healthy fats for coat health",
    "carbs": "e.g. 50% - Complex carbohydrates for sustained energy",
    "fiber": "e.g. 5% - For digestive health"
  },
  "waterIntake": { 
    "target": 1800, 
    "recommendation": "Provide hydration advice based on actual water history and health" 
  },
  "mealFrequency": "e.g. 2 meals per day",
  "portionSize": "e.g. 1.5 cups per meal",
  "weightManagementAdvice": "Specific advice on managing weight based on the doctor's diagnosis",
  "doctorDiagnosisSummary": "Summary of the doctor's findings and how they impact nutrition",
  "nutritionAnalysis": "Intelligent analysis of how the pet's age, breed, weight, and medications affect their diet",
  "weeklyMealPlan": {
    "Day 1": { "Breakfast": "...", "Lunch": "...", "Dinner": "...", "Snacks": "...", "WaterIntake": "..." },
    "Day 2": { "Breakfast": "...", "Lunch": "...", "Dinner": "...", "Snacks": "...", "WaterIntake": "..." },
    "Day 3": { "Breakfast": "...", "Lunch": "...", "Dinner": "...", "Snacks": "...", "WaterIntake": "..." },
    "Day 4": { "Breakfast": "...", "Lunch": "...", "Dinner": "...", "Snacks": "...", "WaterIntake": "..." },
    "Day 5": { "Breakfast": "...", "Lunch": "...", "Dinner": "...", "Snacks": "...", "WaterIntake": "..." },
    "Day 6": { "Breakfast": "...", "Lunch": "...", "Dinner": "...", "Snacks": "...", "WaterIntake": "..." },
    "Day 7": { "Breakfast": "...", "Lunch": "...", "Dinner": "...", "Snacks": "...", "WaterIntake": "..." }
  },
  "foodsToAvoid": [
    { "food": "Chocolate", "reason": "Toxic to dogs" }
  ],
  "recommendedFoods": [
    { "food": "Lean Chicken", "reason": "High quality protein, easy to digest" }
  ],
  "supplements": [
    { "name": "Omega 3", "reason": "Supports joint health and coat condition" }
  ],
  "recoveryDiet": "Specific recovery diet if the pet is recovering from an illness or surgery. Otherwise 'Standard adult diet'.",
  "longTermGoal": "Long term nutrition strategy",
  "nutritionConclusion": "A short, reassuring concluding thought",
  "petCommerceRecommendations": {
    "categories": ["Premium Dry Food", "Weight Management Diet", "Joint Supplements"],
    "goals": ["Weight Loss", "Joint Support"]
  }
}

Analyze the following cleanly formatted data to generate the response:
User Preferences: ${JSON.stringify(preferences)}
Pet Profile: ${JSON.stringify(pet)}
PetHealth AI Report: ${JSON.stringify(pet.aiSummaryCached ? pet.aiSummaryCached.summary : {})}
Medical History (Consultations): ${JSON.stringify(records)}
Vaccinations: ${JSON.stringify(vaccinations)}
Medications: ${JSON.stringify(medications)}
Appointment History (Weight trends): ${JSON.stringify(appointments)}
Water History: ${JSON.stringify(waterHistory)}
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
