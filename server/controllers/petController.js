const Pet = require('../models/Pet');
const { generatePetSummary } = require('../utils/ai');

// @desc    Get all pets for logged in user
// @route   GET /api/pets
// @access  Private
const getPets = async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.user._id }).sort('-createdAt');
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single pet
// @route   GET /api/pets/:id
// @access  Private
const getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    // Make sure user owns pet
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this pet' });
    }

    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private
const createPet = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.owner = req.user._id;

    // Handle image and document uploads if present
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage.length > 0) {
        req.body.profileImage = req.files.profileImage[0].path;
      }
      if (req.files.vaccinationCard && req.files.vaccinationCard.length > 0) {
        req.body.vaccinationCardUrl = req.files.vaccinationCard[0].path;
      }
      if (req.files.medicalReports && req.files.medicalReports.length > 0) {
        req.body.medicalReports = req.files.medicalReports.map(file => file.path);
      }
    }
    
    // Parse arrays that come as strings or JSON strings from FormData
    ['allergies', 'currentDiseases', 'favoriteActivities'].forEach(field => {
      if (req.body[field]) {
        try {
          if (typeof req.body[field] === 'string') {
            req.body[field] = req.body[field].split(',').map(s => s.trim()).filter(Boolean);
          }
        } catch(e) {}
      }
    });

    // Parse aiPreferences if it comes as a JSON string
    if (typeof req.body.aiPreferences === 'string') {
      try {
        req.body.aiPreferences = JSON.parse(req.body.aiPreferences);
      } catch (e) {}
    }

    // Sanitize empty strings for Numbers and Dates to prevent Mongoose CastError
    const fieldsToSanitize = ['mealsPerDay', 'age', 'weight', 'vaccinationDate', 'adoptionDate', 'dateOfBirth'];
    fieldsToSanitize.forEach(field => {
      if (req.body[field] === '') {
        delete req.body[field];
      }
    });

    // Generate AI Summary
    const aiSummary = await generatePetSummary(req.body);
    req.body.aiSummary = aiSummary;

    const pet = await Pet.create(req.body);

    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private
const updatePet = async (req, res, next) => {
  try {
    let pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    // Make sure user owns pet
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this pet' });
    }

    // Handle multiple file uploads if present
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage.length > 0) {
        req.body.profileImage = req.files.profileImage[0].path;
      }
      if (req.files.vaccinationCard && req.files.vaccinationCard.length > 0) {
        req.body.vaccinationCardUrl = req.files.vaccinationCard[0].path;
      }
      if (req.files.medicalReports && req.files.medicalReports.length > 0) {
        // Append new reports to existing ones
        const newReports = req.files.medicalReports.map(file => file.path);
        req.body.medicalReports = [...(pet.medicalReports || []), ...newReports];
      }
    }
    
    // Parse arrays
    ['allergies', 'currentDiseases', 'favoriteActivities'].forEach(field => {
      if (req.body[field] !== undefined) {
        try {
          if (req.body[field] === '') {
            req.body[field] = [];
          } else if (typeof req.body[field] === 'string') {
            req.body[field] = req.body[field].split(',').map(s => s.trim()).filter(Boolean);
          }
        } catch(e) {}
      }
    });

    if (typeof req.body.aiPreferences === 'string') {
      try {
        req.body.aiPreferences = JSON.parse(req.body.aiPreferences);
      } catch (e) {}
    }

    // Build explicit update query to force Mongoose to clear empty fields
    const updateQuery = { $set: {}, $unset: {} };
    
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === '' || req.body[key] === 'null' || req.body[key] === null) {
        updateQuery.$unset[key] = 1;
      } else {
        updateQuery.$set[key] = req.body[key];
      }
    });

    if (Object.keys(updateQuery.$unset).length === 0) delete updateQuery.$unset;
    if (Object.keys(updateQuery.$set).length === 0) delete updateQuery.$set;

    // Regenerate summary
    const aiSummary = await generatePetSummary({ ...pet.toObject(), ...(updateQuery.$set || {}) });
    if (aiSummary) {
      if (!updateQuery.$set) updateQuery.$set = {};
      updateQuery.$set.aiSummary = aiSummary;
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, updateQuery, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private
const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found' });
    }

    // Make sure user owns pet
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this pet' });
    }

    await pet.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet
};
