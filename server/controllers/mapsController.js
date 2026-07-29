const geoapifyService = require('../services/maps/geoapifyService');

// @desc    Get route between two coordinates
// @route   GET /api/maps/route
// @access  Private
const getRoute = async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required coordinates: startLat, startLng, endLat, endLng' 
      });
    }

    const routeData = await geoapifyService.getRoute(startLat, startLng, endLat, endLng);
    
    res.status(200).json({
      success: true,
      data: routeData
    });
  } catch (error) {
    console.error('Error in getRoute:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch route',
      message: error.message 
    });
  }
};

module.exports = {
  getRoute
};
