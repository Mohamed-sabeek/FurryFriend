const Pet = require('../models/Pet');
const HealthRecord = require('../models/HealthRecord');
const Vaccination = require('../models/Vaccination');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const { createChatCompletion } = require('./AI/groqClient');

class HealthSummaryService {
  /**
   * Generates or fetches the AI health report for a pet.
   * @param {string} petId - The ID of the pet
   * @param {string} ownerId - The ID of the owner (for security)
   * @param {boolean} forceRegenerate - If true, ignores the cache and generates a new report
   */
  async generateReport(petId, ownerId, forceRegenerate = false) {
    // 1. Fetch all related data
    const [pet, records, vaccinations, medications, appointments] = await Promise.all([
      Pet.findOne({ _id: petId, owner: ownerId }),
      HealthRecord.find({ pet: petId }).sort({ visitDate: -1 }),
      Vaccination.find({ pet: petId }).sort({ vaccinatedDate: -1 }),
      Medication.find({ pet: petId }).sort({ startDate: -1 }),
      Appointment.find({ pet: petId }).sort({ date: -1 })
    ]);

    if (!pet) throw new Error('Pet not found');

    // 2. Check if cache is valid and not forced to regenerate
    if (!forceRegenerate && pet.aiSummaryCached?.summary) {
      return {
        data: pet.aiSummaryCached.summary,
        cached: true,
        isOutdated: pet.aiSummaryCached.isOutdated
      };
    }

    // Format dates to be human readable strings
    const todayDate = new Date().toISOString().split('T')[0];
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const cleanPet = {
      name: pet.petName,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      weight: `${pet.weight} ${pet.weightUnit}`,
      vaccinationStatus: pet.vaccinationStatus,
      lastVaccinationDate: formatDate(pet.vaccinationDate),
      allergies: pet.allergies,
      currentDiseases: pet.currentDiseases,
      medicalConditions: pet.medicalConditions,
      medications: pet.medications,
      previousSurgeries: pet.previousSurgeries,
      latestDoctorVisit: pet.latestVisit ? {
        date: formatDate(pet.latestVisit.date),
        diagnosis: pet.latestVisit.diagnosis,
        doctor: pet.latestVisit.doctor,
        weight: pet.latestVisit.weight,
        temperature: pet.latestVisit.temperature,
        nextFollowUp: formatDate(pet.latestVisit.nextFollowUp)
      } : null
    };

    const cleanRecords = records.map(r => ({
      visitDate: formatDate(r.visitDate),
      doctor: r.doctor,
      diagnosis: r.diagnosis,
      treatment: r.treatment,
      symptoms: r.symptoms,
      notes: r.notes,
      dietAdvice: r.dietAdvice,
      exerciseAdvice: r.exerciseAdvice
    }));

    const cleanVaccinations = vaccinations.map(v => ({
      vaccineName: v.vaccineName,
      vaccinatedDate: formatDate(v.vaccinatedDate),
      nextDueDate: formatDate(v.nextDueDate),
      doctor: v.doctor
    }));

    const cleanMedications = medications.map(m => ({
      medicineName: m.medicineName,
      dosage: m.dosage,
      frequency: m.frequency,
      purpose: m.purpose,
      startDate: formatDate(m.startDate)
    }));

    const systemPrompt = `You are an expert veterinary AI assistant. Your task is to analyze the provided pet health data, with a primary focus on the latest doctor consultation.
You MUST respond ONLY with a valid JSON object. Do not include markdown formatting or explanation text.
Do NOT diagnose diseases; only summarize the available medical records.
Never ask the user for information. Rely completely on the data provided below.
Calculate all relative dates (like "yesterday", "in 2 weeks") based on Today's Date.
CRITICAL: Do NOT invent, hallucinate, or estimate dates. If a date is provided in the data (e.g., vaccination date), use that exact date. If no date is found, do not mention a date.

Today's Date: ${todayDate}

The JSON must follow this exact structure:
{
  "healthScore": 95,
  "currentStatus": "Summarize general health, active illnesses, and last checkup status.",
  "medicalSummary": "A high-level summary of the pet's medical history.",
  "diagnosisSummary": "Summarize the latest doctor's diagnosis, if any.",
  "medicationSummary": "Summarize active medications, dosage, frequency, and purpose. Or 'No active medications'.",
  "vaccinationStatus": "Summarize current, due, and upcoming vaccinations.",
  "recoveryProgress": "Analyze recovery progress compared with previous consultations.",
  "weightAnalysis": "Compare current weight with previous visits, identify gain or loss.",
  "temperatureAnalysis": "Analyze the recorded temperature.",
  "heartRateAnalysis": "Analyze the recorded heart rate.",
  "healthRisks": "Identify any potential risks based on weight, age, or past history.",
  "possibleFutureRisks": "Identify potential future risks based on current health trends.",
  "preventiveCareRecommendations": "Suggestions for preventive care (e.g. flea/tick, dental).",
  "lifestyleRecommendations": "Suggestions for general lifestyle improvements.",
  "exerciseRecommendations": "Suggestions based on the doctor's exercise advice or breed/weight.",
  "dietRecommendations": "Suggestions based on the doctor's diet advice or current weight.",
  "recommendedFollowUp": "When the next visit is due.",
  "emergencyWarning": "Any immediate warnings (leave empty string if none).",
  "overallConclusion": "A short, reassuring concluding thought."
}

Analyze the following cleanly formatted data:
Pet Profile: ${JSON.stringify(cleanPet)}
Medical History (Consultations): ${JSON.stringify(cleanRecords)}
Vaccinations: ${JSON.stringify(cleanVaccinations)}
Medications: ${JSON.stringify(cleanMedications)}
`;

    // 4. Call LLM
    let aiResponse;
    const chatResponse = await createChatCompletion({
      messages: [{ role: 'system', content: systemPrompt }],
      temperature: 0.2
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

    // Ensure string fields instead of objects/arrays
    const formatField = (fieldData) => {
      if (!fieldData) return null;
      if (Array.isArray(fieldData)) {
        return fieldData.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join('\n');
      }
      if (typeof fieldData === 'object') {
        return JSON.stringify(fieldData);
      }
      return String(fieldData);
    };

    const keysToFormat = [
      'currentStatus', 'medicalSummary', 'diagnosisSummary', 'medicationSummary', 
      'vaccinationStatus', 'recoveryProgress', 'weightAnalysis', 'temperatureAnalysis',
      'heartRateAnalysis', 'healthRisks', 'possibleFutureRisks', 'preventiveCareRecommendations', 
      'lifestyleRecommendations', 'exerciseRecommendations', 'dietRecommendations', 
      'recommendedFollowUp', 'emergencyWarning', 'overallConclusion'
    ];

    keysToFormat.forEach(key => {
      if (aiResponse[key]) {
        aiResponse[key] = formatField(aiResponse[key]);
      }
    });

    // 5. Save Cache
    const updatedCache = {
      summary: aiResponse,
      generatedAt: new Date(),
      lastDataVersion: new Date(),
      isOutdated: false
    };

    await Pet.updateOne(
      { _id: pet._id },
      { $set: { aiSummaryCached: updatedCache } },
      { timestamps: false }
    );

    return {
      data: aiResponse,
      cached: false,
      isOutdated: false
    };
  }

  /**
   * Invalidates the cache for a pet by setting the isOutdated flag to true.
   * This is typically called when a new consultation is saved.
   * @param {string} petId - The ID of the pet
   */
  async invalidateCache(petId) {
    await Pet.updateOne(
      { _id: petId },
      { $set: { 'aiSummaryCached.isOutdated': true } },
      { timestamps: false }
    );
  }
}

module.exports = new HealthSummaryService();
