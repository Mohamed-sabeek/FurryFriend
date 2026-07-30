const EmergencyReport = require('../models/EmergencyReport');
const EmergencyImage = require('../models/EmergencyImages');
const Pet = require('../models/Pet');
const EmergencyContextService = require('../services/EmergencyContextService');
const PetEmergencyAIService = require('../services/PetEmergencyAIService');

exports.analyzeEmergency = async (req, res) => {
  try {
    console.log("=========================================");
    console.log("STARTING EMERGENCY ANALYSIS PIPELINE");
    console.log("=========================================");

    const userId = req.user?.id;
    console.log(`✓ User ID: ${userId}`);
    
    const { petId, emergencyType, symptoms, notes } = req.body;
    console.log(`✓ Request Body: petId=${petId}, emergencyType=${emergencyType}`);

    if (!petId || !emergencyType) {
      return res.status(400).json({ success: false, message: 'Pet ID and Emergency Type are required.' });
    }

    if (!req.files || req.files.length === 0) {
      console.error("❌ No image received from Multer.");
      return res.status(400).json({ success: false, message: 'No image received.' });
    }

    console.log(`✓ Received ${req.files.length} file(s) from Multer`);
    let images = [];
    req.files.forEach((file, index) => {
      console.log(`  File ${index + 1}: ${file.originalname} | Type: ${file.mimetype} | Size: ${file.size} bytes`);
      console.log(`  Cloudinary URL: ${file.path}`);
      
      if (!file.path) {
        console.error("❌ Image upload failed. Cloudinary secure_url is missing.");
      } else {
        images.push({
          secure_url: file.path,
          public_id: file.filename
        });
      }
    });

    if (images.length === 0) {
      return res.status(500).json({ success: false, message: 'Image upload failed.' });
    }

    // Build context
    const emergencyDetails = {
      emergencyType,
      symptoms: symptoms ? JSON.parse(symptoms) : [],
      notes
    };
    
    let context;
    try {
      context = await EmergencyContextService.buildContext(petId, emergencyDetails);
      console.log("✓ Context successfully built for Pet");
    } catch (err) {
      console.error("❌ Context Building Error:", err);
      return res.status(404).json({ success: false, message: err.message, details: err.stack });
    }

    // Analyze with AI
    let aiResult;
    try {
      console.log("✓ Starting AI Analysis with Gemini 2.5 Flash Vision");
      aiResult = await PetEmergencyAIService.analyzeEmergency(context, images);
      console.log("✓ AI Analysis successful");
    } catch (err) {
      console.error("❌ AI Analysis Error:", err.message);
      if (err.response?.data) console.error("API Response Data:", err.response.data);
      console.error(err.stack);
      return res.status(500).json({ 
        success: false, 
        message: err.message,
        details: err.response?.data || err.stack
      });
    }

    // Save Emergency Report
    try {
      console.log("✓ Saving Emergency Report to MongoDB");
      const aiResponse = aiResult.analysis;
      const metadata = aiResult.metadata;

      const newReport = new EmergencyReport({
        user: userId,
        pet: petId,
        emergencyType,
        symptoms: emergencyDetails.symptoms,
        notes,
        images,
        severity: aiResponse.severity,
        confidence: aiResponse.confidence,
        possibleCondition: aiResponse.possibleConditions?.[0] || 'Unknown',
        possibleCauses: aiResponse.possibleConditions || [],
        findings: aiResponse.visibleFindings || [],
        firstAid: aiResponse.firstAid || [],
        avoid: aiResponse.doNotDo || [],
        recommendedProducts: aiResponse.recommendedProducts || [],
        preventionTips: aiResponse.preventionTips || [],
        estimatedRecovery: aiResponse.followUpAdvice?.[0] || 'Unknown',
        needVet: aiResponse.visitVet,
        visitWithin: aiResponse.visitWithin,
        status: 'Analyzed',
        analysis: aiResponse,
        aiModel: metadata.model,
        metadata
      });

      const savedReport = await newReport.save();
      console.log(`✓ Report saved successfully. ID: ${savedReport._id}`);

      // Save images to new collection
      const imagePromises = images.map(img => 
        new EmergencyImage({
          reportId: savedReport._id,
          cloudinaryUrl: img.secure_url,
          publicId: img.public_id
        }).save()
      );
      await Promise.all(imagePromises);
      console.log(`✓ Saved ${images.length} images to EmergencyImages collection`);

      // Update Pet model automatically
      await Pet.findByIdAndUpdate(petId, {
        $set: {
          latestEmergency: {
            reportId: savedReport._id,
            severity: savedReport.severity,
            condition: savedReport.possibleCondition,
            date: savedReport.createdAt,
            status: savedReport.status
          }
        },
        $push: {
          emergencyHistory: {
            reportId: savedReport._id,
            date: savedReport.createdAt
          }
        }
      });
      console.log("✓ Pet History updated successfully");

      res.status(201).json({
        success: true,
        message: 'Emergency analysis complete',
        data: savedReport
      });
    } catch (err) {
      console.error("❌ MongoDB Save Error:", err.message);
      console.error(err.stack);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error while saving report',
        details: err.message 
      });
    }

  } catch (error) {
    console.error("❌ Unexpected System Error:", error.message);
    console.error(error.stack);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      details: error.response?.data || error.stack
    });
  }
};

exports.getEmergencyHistory = async (req, res) => {
  try {
    const history = await EmergencyReport.find({ user: req.user.id })
      .populate('pet', 'name species')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error('Get Emergency History Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving history' });
  }
};

exports.getEmergencyReport = async (req, res) => {
  try {
    const report = await EmergencyReport.findOne({ _id: req.params.id, user: req.user.id })
      .populate('pet', 'name species breed age');
      
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Get Emergency Report Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving report' });
  }
};

exports.deleteEmergencyReport = async (req, res) => {
  try {
    const report = await EmergencyReport.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    // Note: To be fully production-ready, we should also delete Cloudinary images here using cloudinary.uploader.destroy(public_id)
    // and remove from Pet.emergencyHistory.

    await Pet.findByIdAndUpdate(report.pet, {
      $pull: { emergencyHistory: { reportId: req.params.id } }
    });

    res.status(200).json({ success: true, message: 'Emergency report deleted' });
  } catch (error) {
    console.error('Delete Emergency Report Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting report' });
  }
};
