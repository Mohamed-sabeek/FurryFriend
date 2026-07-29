const express = require('express');
const {
  getNutritionPlan,
  generateNutritionPlan
} = require('../controllers/nutriController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:petId/plan', getNutritionPlan);
router.post('/:petId/generate', generateNutritionPlan);

module.exports = router;
