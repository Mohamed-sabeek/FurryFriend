const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const Pet = require('../models/Pet');
const Medication = require('../models/Medication');
const Vaccination = require('../models/Vaccination');
const AIOrchestratorService = require('./AIOrchestratorService');

exports.saveConsultation = async (appointmentId, clinicId, doctorName, payload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(appointmentId).session(session);
    if (!appointment) throw new Error('Appointment not found');
    if (appointment.clinic.toString() !== clinicId.toString()) throw new Error('Unauthorized');
    if (appointment.status === 'Completed') throw new Error('Already completed');

    // 1. Create Health Record
    const healthRecord = new HealthRecord({
      user: appointment.user,
      pet: appointment.pet,
      visitType: appointment.type || 'Consultation',
      hospital: appointment.hospitalName || 'Clinic',
      doctor: doctorName,
      visitDate: new Date(),
      symptoms: payload.symptoms || [],
      diagnosis: payload.diagnosis,
      treatment: payload.treatment,
      notes: payload.notes,
      weight: payload.weight,
      temperature: payload.temperature,
      heartRate: payload.heartRate,
      allergies: payload.allergies || [],
      dietAdvice: payload.dietAdvice,
      exerciseAdvice: payload.exerciseAdvice,
      followUpDate: payload.followUpDate,
      appointmentId: appointment._id
    });
    await healthRecord.save({ session });

    // 2. Create Medications
    if (payload.medicines && payload.medicines.length > 0) {
      const meds = payload.medicines.map(m => ({
        user: appointment.user,
        pet: appointment.pet,
        medicineName: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        startDate: new Date(),
        purpose: m.purpose || payload.diagnosis,
        appointmentId: appointment._id,
        healthRecordId: healthRecord._id
      }));
      await Medication.insertMany(meds, { session });
    }

    // 3. Create Vaccinations
    if (payload.vaccinations && payload.vaccinations.length > 0) {
      const vaccs = payload.vaccinations.map(v => ({
        user: appointment.user,
        pet: appointment.pet,
        vaccineName: v.name,
        dose: v.dose,
        vaccinatedDate: new Date(),
        nextDueDate: v.nextDueDate,
        hospital: appointment.hospitalName,
        doctor: doctorName,
        appointmentId: appointment._id,
        healthRecordId: healthRecord._id
      }));
      await Vaccination.insertMany(vaccs, { session });
    }

    const petUpdate = {
      'latestVisit.date': new Date(),
      'latestVisit.diagnosis': payload.diagnosis,
      'latestVisit.doctor': doctorName,
      'latestVisit.weight': payload.weight,
      'latestVisit.temperature': payload.temperature,
      'latestVisit.nextFollowUp': payload.followUpDate,
      'latestVisit.appointmentId': appointment._id,
      // Mark the AI cache as outdated so the UI can show the banner
      'aiSummaryCached.isOutdated': true
    };
    if (payload.weight) petUpdate.weight = payload.weight;
    if (payload.allergies && payload.allergies.length > 0) {
      petUpdate.$addToSet = { allergies: { $each: payload.allergies } };
    }
    if (payload.vaccinations && payload.vaccinations.length > 0) {
      petUpdate.vaccinationStatus = 'Up to date';
      petUpdate.vaccinationDate = new Date();
    }
    
    await Pet.findByIdAndUpdate(appointment.pet, petUpdate, { session });

    // 5. Update Appointment Status
    appointment.status = 'Completed';
    appointment.completedAt = new Date();
    appointment.consultationCompleted = true;
    appointment.healthRecordId = healthRecord._id;
    await appointment.save({ session });

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // Trigger AI Orchestrator asynchronously
    AIOrchestratorService.triggerPostConsultationUpdate(appointment.pet, healthRecord._id).catch(err => {
      console.error('AI Orchestrator Error:', err);
    });

    return { success: true, healthRecord };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
