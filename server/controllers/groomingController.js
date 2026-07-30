const GroomingPlan = require('../models/GroomingPlan');
const GroomingCenter = require('../models/GroomingCenter');
const GroomingAppointment = require('../models/GroomingAppointment');
const Pet = require('../models/Pet');
const HealthRecord = require('../models/HealthRecord');
const NutritionPlan = require('../models/NutritionPlan');
const { createChatCompletion } = require('../services/AI/groqClient');

const calculateMaxUpdatedAt = (docsArray) => {
  if (!docsArray || docsArray.length === 0) return 0;
  return Math.max(...docsArray.map(doc => new Date(doc.updatedAt).getTime() || 0));
};

exports.getGroomingCenters = async (req, res) => {
  try {
    const centers = await GroomingCenter.find({});
    res.status(200).json({ success: true, data: centers });
  } catch (error) {
    console.error('Error fetching grooming centers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch grooming centers' });
  }
};

exports.getGroomingPlan = async (req, res) => {
  try {
    const { petId } = req.params;
    
    const [pet, records, latestPlan] = await Promise.all([
      Pet.findOne({ _id: petId, owner: req.user.id }),
      HealthRecord.find({ pet: petId }).sort({ visitDate: -1 }),
      GroomingPlan.findOne({ pet: petId, user: req.user.id }).sort({ createdAt: -1 })
    ]);

    if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });

    const maxPetUpdate = new Date(pet.updatedAt).getTime() || 0;
    const maxRecordUpdate = calculateMaxUpdatedAt(records);
    const lastDataVersionTime = Math.max(maxPetUpdate, maxRecordUpdate);
    
    const isCacheValid = latestPlan && latestPlan.dataVersion && new Date(latestPlan.dataVersion).getTime() >= lastDataVersionTime;
    
    if (latestPlan) {
      if (isCacheValid) {
        return res.status(200).json({ success: true, data: latestPlan, cached: true, isStale: false });
      } else {
        return res.status(200).json({ success: true, data: latestPlan, cached: true, isStale: true });
      }
    }
    
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    console.error('Error getting grooming plan:', error);
    res.status(500).json({ success: false, error: 'Failed to get grooming plan' });
  }
};

exports.generateGroomingPlan = async (req, res) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findOne({ _id: petId, owner: req.user.id });
    if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });

    const [records, latestNutrition] = await Promise.all([
      HealthRecord.find({ pet: petId }).sort({ visitDate: -1 }),
      NutritionPlan.findOne({ pet: petId, user: req.user.id }).sort({ createdAt: -1 })
    ]);

    const maxPetUpdate = new Date(pet.updatedAt).getTime() || 0;
    const maxRecordUpdate = calculateMaxUpdatedAt(records);
    const newDataVersion = new Date(Math.max(maxPetUpdate, maxRecordUpdate));

    const petData = {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      gender: pet.gender
    };

    const medicalContext = records.length > 0 ? records[0] : 'No recent medical records available.';
    const nutritionContext = latestNutrition ? { score: latestNutrition.nutritionScore, skinNutrition: latestNutrition.skinNutrition } : 'No nutrition data available.';

    const systemPrompt = `You are GroomEase AI, a certified professional pet groomer and canine/feline coat care specialist with knowledge of veterinary grooming, skin care, breed-specific grooming techniques and preventive grooming.
You never invent diseases. You always prioritize the doctor's diagnosis. Generate evidence-based grooming advice.`;

    const userPrompt = `
Analyze the following pet data and generate a comprehensive grooming plan in exact JSON format.

Pet Data:
${JSON.stringify(petData, null, 2)}

Latest Medical Record:
${JSON.stringify(medicalContext, null, 2)}

Nutrition Data:
${JSON.stringify(nutritionContext, null, 2)}

Output MUST be valid JSON conforming exactly to this structure:
{
  "groomingScore": 85,
  "overallSummary": "Brief overview of the pet's current grooming needs based on breed and health.",
  "professionalRequirement": "Explanation of whether professional grooming is needed and why.",
  "homeRecommendation": "Recommendations for home grooming maintenance.",
  "coatAnalysis": "Detailed analysis of the coat type based on the breed.",
  "skinAnalysis": "Detailed analysis of the skin based on the doctor's diagnosis (if any) or breed predispositions.",
  "earHygiene": "Ear cleaning recommendations.",
  "eyeHygiene": "Eye cleaning recommendations.",
  "dentalHygiene": "Teeth brushing recommendations.",
  "nailCondition": "Nail trimming recommendations.",
  "pawCondition": "Paw care recommendations.",
  "recommendedStyle": {
    "name": "e.g., Puppy Cut, Full Coat Maintenance, Basic Bath & Brush",
    "reason": "Why this style is recommended for this specific pet and medical condition."
  },
  "schedule": [
    { "task": "Brush Coat", "frequency": "3 times/week" },
    { "task": "Bath", "frequency": "Every 4 weeks" }
  ],
  "recommendedProducts": ["Medicated Shampoo", "Conditioner", "Slicker Brush", "Ear Cleaner", "Nail Clipper"]
}
`;

    const chatCompletion = await createChatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2
    });

    let jsonString = chatCompletion.content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Sometimes the LLM includes explanatory text outside the JSON. Extract just the JSON block.
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonString = jsonMatch[0];
    }

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse Groq response:', jsonString);
      return res.status(500).json({ success: false, error: 'Failed to generate a valid Grooming Plan. Please try again.' });
    }

    const ensureString = (val) => {
      if (typeof val === 'string') return val;
      if (val && typeof val === 'object') {
        try {
          return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join(' ');
        } catch(e) {
          return JSON.stringify(val);
        }
      }
      return String(val || '');
    };

    const groomingPlan = new GroomingPlan({
      user: req.user.id,
      pet: pet._id,
      groomingScore: parsedPlan.groomingScore,
      overallSummary: ensureString(parsedPlan.overallSummary),
      professionalRequirement: ensureString(parsedPlan.professionalRequirement),
      homeRecommendation: ensureString(parsedPlan.homeRecommendation),
      coatAnalysis: ensureString(parsedPlan.coatAnalysis),
      skinAnalysis: ensureString(parsedPlan.skinAnalysis),
      earHygiene: ensureString(parsedPlan.earHygiene),
      eyeHygiene: ensureString(parsedPlan.eyeHygiene),
      dentalHygiene: ensureString(parsedPlan.dentalHygiene),
      nailCondition: ensureString(parsedPlan.nailCondition),
      pawCondition: ensureString(parsedPlan.pawCondition),
      recommendedStyle: parsedPlan.recommendedStyle,
      schedule: parsedPlan.schedule || [],
      recommendedProducts: parsedPlan.recommendedProducts || [],
      dataVersion: newDataVersion
    });

    await groomingPlan.save();

    res.status(200).json({ success: true, data: groomingPlan });
  } catch (error) {
    console.error('Error generating grooming plan:', error);
    res.status(500).json({ success: false, error: 'Internal server error while generating grooming plan' });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const { pet, center, selectedServices, recommendedStyle, specialRequests, date, time } = req.body;
    
    const appointment = new GroomingAppointment({
      user: req.user.id,
      pet,
      center,
      selectedServices,
      recommendedStyle,
      specialRequests,
      date,
      time,
      status: 'Pending',
      timeline: [{ status: 'Pending', note: 'Appointment booked' }]
    });
    
    await appointment.save();
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error booking grooming appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to book appointment' });
  }
};

exports.getCustomerGroomingAppointments = async (req, res) => {
  try {
    const appointments = await GroomingAppointment.find({ user: req.user.id })
      .populate('pet', 'petName species profileImage')
      .populate('center', 'name address city')
      .sort({ date: 1, time: 1 });

    const upcoming = appointments.filter(a => ['Pending', 'Accepted', 'In Progress'].includes(a.status));
    const completed = appointments.filter(a => a.status === 'Completed');
    const cancelled = appointments.filter(a => a.status === 'Cancelled');

    res.status(200).json({
      success: true,
      stats: {
        upcoming: upcoming.length,
        completed: completed.length,
        cancelled: cancelled.length,
        pending: upcoming.filter(a => a.status === 'Pending').length
      },
      data: {
        upcoming,
        completed,
        cancelled
      }
    });
  } catch (error) {
    console.error('Error fetching customer grooming appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch appointments' });
  }
};

// --- Grooming Center Dashboard APIs ---

exports.getCenterDashboardStats = async (req, res) => {
  try {
    const centerId = req.user.groomingCenterId;
    if (!centerId) return res.status(403).json({ success: false, message: 'Not a grooming center' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await GroomingAppointment.countDocuments({
      center: centerId,
      date: { $gte: today, $lt: tomorrow }
    });
    const pendingAppointments = await GroomingAppointment.countDocuments({
      center: centerId,
      status: 'Pending'
    });
    const completedAppointments = await GroomingAppointment.countDocuments({
      center: centerId,
      status: 'Completed'
    });

    res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        pendingAppointments,
        completedAppointments
      }
    });
  } catch (error) {
    console.error('Error fetching center stats:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.getCenterAppointments = async (req, res) => {
  try {
    const centerId = req.user.groomingCenterId;
    const { status, date } = req.query;
    
    let query = { center: centerId };
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (date) {
      const qDate = new Date(date);
      qDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(qDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: qDate, $lt: nextDate };
    }

    const appointments = await GroomingAppointment.find(query)
      .populate('pet', 'petName species breed profileImage ownerName')
      .populate('user', 'fullName phone')
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching center appointments:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const centerId = req.user.groomingCenterId;

    const appointment = await GroomingAppointment.findOne({ _id: id, center: centerId });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.completeGrooming = async (req, res) => {
  try {
    const { id } = req.params;
    const { servicesPerformed, productsUsed, coatCondition, skinCondition, behaviour, specialNotes, recommendedInterval, nextGroomingDate, homeCareTips } = req.body;
    const centerId = req.user.groomingCenterId;

    const appointment = await GroomingAppointment.findOne({ _id: id, center: centerId }).populate('center');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = 'Completed';
    appointment.report = {
      servicesPerformed,
      productsUsed,
      coatCondition,
      skinCondition,
      behaviour,
      specialNotes,
      recommendedInterval,
      nextGroomingDate,
      homeCareTips
    };
    await appointment.save();

    // Update Pet model
    const Pet = require('../models/Pet');
    const pet = await Pet.findById(appointment.pet);
    if (pet) {
      const groomingData = {
        date: appointment.date,
        center: appointment.center._id,
        centerName: appointment.center.name,
        services: servicesPerformed,
        products: productsUsed,
        notes: specialNotes,
        nextGroomingDate,
        appointmentId: appointment._id
      };
      
      pet.latestGrooming = groomingData;
      pet.groomingHistory.push(groomingData);
      
      // Expire GroomEase AI Cache so it recommends new plan
      if (pet.aiSummaryCached && pet.aiSummaryCached.summary && pet.aiSummaryCached.summary.recommendedStyle) {
         pet.aiSummaryCached.isOutdated = true; 
         pet.aiSummaryCached.lastDataVersion = new Date();
      }

      await pet.save();
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Error completing grooming:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get Grooming Center Profile
// @route   GET /api/grooming/profile
// @access  Private (Center only)
exports.getCenterProfile = async (req, res) => {
  try {
    const centerId = req.user.groomingCenterId;
    if (!centerId) return res.status(403).json({ success: false, message: 'Not a grooming center' });

    const center = await GroomingCenter.findById(centerId);
    if (!center) return res.status(404).json({ success: false, message: 'Center not found' });

    res.status(200).json({ success: true, data: center });
  } catch (error) {
    console.error('Error getting center profile:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update Grooming Center Profile
// @route   PUT /api/grooming/profile
// @access  Private (Center only)
exports.updateCenterProfile = async (req, res) => {
  try {
    const centerId = req.user.groomingCenterId;
    if (!centerId) return res.status(403).json({ success: false, message: 'Not a grooming center' });

    let center = await GroomingCenter.findById(centerId);
    if (!center) return res.status(404).json({ success: false, message: 'Center not found' });

    center = await GroomingCenter.findByIdAndUpdate(
      centerId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Also update User profile name if name changed
    if (req.body.name) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, { fullName: req.body.name });
    }

    res.status(200).json({ success: true, data: center });
  } catch (error) {
    console.error('Error updating center profile:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
