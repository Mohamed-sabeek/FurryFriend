const WaterLog = require('../models/WaterLog');

const getTodayString = () => {
  const date = new Date();
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// ─── GET /api/water/:petId/today ─────────────────────────────────────────────
exports.getTodayWater = async (req, res) => {
  try {
    const { petId } = req.params;
    const today = getTodayString();
    
    const log = await WaterLog.findOne({ pet: petId, user: req.user.id, dateString: today });
    
    res.status(200).json({
      success: true,
      data: log ? log.amount : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── GET /api/water/:petId/history ───────────────────────────────────────────
exports.getWaterHistory = async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Fetch last 7 days of logs
    const logs = await WaterLog.find({ pet: petId, user: req.user.id })
      .sort({ dateString: -1 })
      .limit(7);
      
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── POST /api/water/:petId/log ──────────────────────────────────────────────
exports.logWater = async (req, res) => {
  try {
    const { petId } = req.params;
    const { amount } = req.body; // e.g. 250 (ml)
    const today = getTodayString();
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be positive' });
    }
    
    // Upsert the log for today
    const updatedLog = await WaterLog.findOneAndUpdate(
      { pet: petId, user: req.user.id, dateString: today },
      { $inc: { amount: amount } }, // increment
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.status(200).json({ success: true, data: updatedLog });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
