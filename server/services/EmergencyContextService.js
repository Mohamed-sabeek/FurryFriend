const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const EmergencyReport = require('../models/EmergencyReport');

class EmergencyContextService {
  /**
   * Build the comprehensive context object for the AI Model.
   * @param {string} petId 
   * @param {Object} emergencyDetails 
   * @returns {Object} Context object
   */
  static async buildContext(petId, emergencyDetails) {
    const { emergencyType, symptoms, notes } = emergencyDetails;

    // 1. Fetch Pet Profile
    const pet = await Pet.findById(petId).lean();
    if (!pet) throw new Error('Pet not found');

    // 2. Fetch Latest Doctor Consultation
    const latestConsultation = await Appointment.findOne({ pet: petId, status: 'Completed' })
      .sort({ date: -1 })
      .lean();

    // 3. Fetch Latest Health Report
    const latestHealthRecord = await HealthRecord.findOne({ pet: petId })
      .sort({ date: -1 })
      .lean();

    // 4. Fetch Previous Emergency Reports
    const previousEmergencies = await EmergencyReport.find({ pet: petId, status: { $ne: 'Failed' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 5. Structure Context
    return {
      petProfile: {
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        gender: pet.gender,
        medicalHistory: pet.medicalHistory || [],
        currentMedications: pet.currentMedications || [],
        vaccinations: pet.vaccinations || []
      },
      latestConsultation: latestConsultation ? {
        date: latestConsultation.date,
        reason: latestConsultation.reason,
        notes: latestConsultation.notes,
        diagnosis: latestConsultation.diagnosis,
        prescriptions: latestConsultation.prescriptions
      } : null,
      latestHealthReport: latestHealthRecord ? {
        date: latestHealthRecord.date,
        recordType: latestHealthRecord.recordType,
        title: latestHealthRecord.title,
        description: latestHealthRecord.description
      } : null,
      previousEmergencies: previousEmergencies.map(e => ({
        date: e.createdAt,
        type: e.emergencyType,
        severity: e.severity,
        condition: e.possibleCondition,
        status: e.status
      })),
      currentEmergency: {
        type: emergencyType,
        symptoms: symptoms || [],
        ownerNotes: notes || 'None provided'
      }
    };
  }
}

module.exports = EmergencyContextService;
