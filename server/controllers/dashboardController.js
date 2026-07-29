const Pet = require('../models/Pet');
// Other models like Appointment, Order, HealthReport would be required here

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch the user's pets
    const pets = await Pet.find({ owner: userId }).sort({ createdAt: -1 });

    // In a real application, we would fetch actual appointments, orders, etc.
    // For now, we return placeholder counts and data structures to satisfy the UI
    const dashboardData = {
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        profileImage: req.user.profileImage
      },
      stats: {
        totalPets: pets.length,
        upcomingAppointments: 0, // Placeholder
        healthReports: 0, // Placeholder
        activeOrders: 0 // Placeholder
      },
      pets,
      recentActivity: [
        // Placeholders for UI timeline
      ],
      aiSummary: {
        status: 'healthy',
        message: 'Your pets are healthy today',
        points: [
          'No upcoming vaccinations',
          'Nutrition plan looks good'
        ]
      }
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData
};
