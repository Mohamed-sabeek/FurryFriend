const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
// Other models like Order, HealthReport would be required here

// @desc    Get dashboard summary
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch the user's pets
    const pets = await Pet.find({ owner: userId }).sort({ createdAt: -1 });

    // Fetch appointment count
    const totalAppointments = await Appointment.countDocuments({ user: userId });

    // Fetch health reports count
    const HealthRecord = require('../models/HealthRecord');
    const healthReportsCount = await HealthRecord.countDocuments({ user: userId });

    // In a real application, we would fetch actual orders, etc.
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
        upcomingAppointments: totalAppointments,
        healthReports: healthReportsCount,
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
