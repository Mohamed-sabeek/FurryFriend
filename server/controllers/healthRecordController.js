const HealthRecord = require('../models/HealthRecord');
const Vaccination = require('../models/Vaccination');
const Medication = require('../models/Medication');
const MedicalDocument = require('../models/MedicalDocument');
const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');

// ─── GET /api/health-records/pet/:petId ───────────────────────────────────────
// Fetches unified timeline data
const getPetTimeline = async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Verify pet belongs to user
    const pet = await Pet.findOne({ _id: petId, owner: req.user.id });
    if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });

    // Fetch all related data
    const [records, vaccinations, medications, documents, appointments] = await Promise.all([
      HealthRecord.find({ pet: petId }).sort({ visitDate: -1 }),
      Vaccination.find({ pet: petId }).sort({ vaccinatedDate: -1 }),
      Medication.find({ pet: petId }).sort({ startDate: -1 }),
      MedicalDocument.find({ pet: petId }).sort({ uploadedAt: -1 }),
      Appointment.find({ pet: petId }).sort({ date: -1 })
    ]);

    // Build timeline array
    const timeline = [];

    records.forEach(r => timeline.push({ type: 'record', date: r.visitDate, data: r }));
    vaccinations.forEach(v => timeline.push({ type: 'vaccination', date: v.vaccinatedDate, data: v }));
    medications.forEach(m => timeline.push({ type: 'medication', date: m.startDate, data: m }));
    appointments.forEach(a => timeline.push({ type: 'appointment', date: a.date, data: a }));

    // Sort timeline descending (newest first)
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      data: {
        pet,
        timeline,
        records,
        vaccinations,
        medications,
        documents,
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── HEALTH RECORDS ────────────────────────────────────────────────────────────
const addHealthRecord = async (req, res) => {
  try {
    const { petId } = req.params;
    const record = await HealthRecord.create({ ...req.body, user: req.user.id, pet: petId });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── VACCINATIONS ─────────────────────────────────────────────────────────────
const addVaccination = async (req, res) => {
  try {
    const { petId } = req.params;
    const vaccination = await Vaccination.create({ ...req.body, user: req.user.id, pet: petId });
    res.status(201).json({ success: true, data: vaccination });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── MEDICATIONS ──────────────────────────────────────────────────────────────
const addMedication = async (req, res) => {
  try {
    const { petId } = req.params;
    const medication = await Medication.create({ ...req.body, user: req.user.id, pet: petId });
    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── DOCUMENTS ────────────────────────────────────────────────────────────────
const addDocument = async (req, res) => {
  try {
    const { petId } = req.params;
    const document = await MedicalDocument.create({ ...req.body, user: req.user.id, pet: petId });
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPetTimeline,
  addHealthRecord,
  addVaccination,
  addMedication,
  addDocument
};
