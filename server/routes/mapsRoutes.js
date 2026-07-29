const express = require('express');
const router = express.Router();
const { getRoute } = require('../controllers/mapsController');
const { protect } = require('../middleware/auth');

router.get('/route', protect, getRoute);

module.exports = router;
