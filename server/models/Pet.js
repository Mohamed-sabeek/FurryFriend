const mongoose = require('mongoose');

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    petName: {
      type: String,
      required: [true, 'Please add a pet name']
    },
    species: {
      type: String,
      required: [true, 'Please add a species'],
      enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Turtle', 'Other']
    },
    breed: {
      type: String,
      default: ''
    },
    isMixedBreed: {
      type: Boolean,
      default: false
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Unknown'],
      default: 'Unknown'
    },
    dateOfBirth: {
      type: Date
    },
    age: {
      type: Number,
      min: 0
    },
    weight: {
      type: Number,
      min: 0
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    },
    color: {
      type: String,
      default: ''
    },
    profileImage: {
      type: String,
      default: ''
    },
    vaccinationStatus: {
      type: String,
      enum: ['Up to date', 'Needs update', 'Unknown'],
      default: 'Unknown'
    },
    vaccinationDate: {
      type: Date
    },
    vaccinationCardUrl: {
      type: String,
      default: ''
    },
    microchipNumber: {
      type: String,
      default: ''
    },
    adoptionDate: {
      type: Date
    },
    allergies: {
      type: [String],
      default: []
    },
    currentDiseases: {
      type: [String],
      default: []
    },
    medicalConditions: {
      type: String,
      default: ''
    },
    medications: {
      type: String,
      default: ''
    },
    previousSurgeries: {
      type: String,
      default: ''
    },
    currentVeterinarian: {
      type: String,
      default: ''
    },
    foodType: {
      type: String,
      enum: ['Dry', 'Wet', 'Homemade', 'Mixed', ''],
      default: ''
    },
    mealsPerDay: {
      type: Number
    },
    waterIntake: {
      type: String,
      default: ''
    },
    diet: {
      type: String,
      default: ''
    },
    favoriteFood: {
      type: String,
      default: ''
    },
    livingStyle: {
      type: String,
      enum: ['Indoor', 'Outdoor', 'Both', ''],
      default: ''
    },
    activityLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Unknown'],
      default: 'Unknown'
    },
    favoriteActivities: {
      type: [String],
      default: []
    },
    temperament: {
      type: String,
      enum: ['Friendly', 'Calm', 'Shy', 'Aggressive', 'Unknown', ''],
      default: 'Unknown'
    },
    trainingLevel: {
      type: String,
      enum: ['None', 'Basic', 'Intermediate', 'Advanced', ''],
      default: ''
    },
    hairLength: {
      type: String,
      enum: ['Short', 'Medium', 'Long', 'Hairless', ''],
      default: ''
    },
    sheddingLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Unknown', ''],
      default: 'Unknown'
    },
    bathFrequency: {
      type: String,
      default: ''
    },
    nailTrimFrequency: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    isNeutered: {
      type: Boolean,
      default: false
    },
    emergencyContact: {
      type: String,
      default: ''
    },
    medicalNotes: {
      type: String,
      default: ''
    },
    medicalReports: {
      type: [String],
      default: []
    },
    latestVisit: {
      date: { type: Date },
      diagnosis: { type: String },
      doctor: { type: String },
      weight: { type: Number },
      temperature: { type: Number },
      nextFollowUp: { type: Date },
      appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
    },
    aiPreferences: {
      healthMonitoring: { type: Boolean, default: true },
      dietRecommendations: { type: Boolean, default: true },
      groomingSuggestions: { type: Boolean, default: true },
      vaccinationReminders: { type: Boolean, default: true },
      healthTrendAnalysis: { type: Boolean, default: true }
    },
    aiSummaryCached: {
      summary: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      },
      generatedAt: { type: Date, default: null },
      lastDataVersion: { type: Date, default: null },
      isOutdated: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Pet', petSchema);
