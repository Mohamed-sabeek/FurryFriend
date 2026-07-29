const express = require('express');
const { getProducts, getProductById, getRecommendedProductsForPet } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/recommended/:petId', protect, getRecommendedProductsForPet);
router.get('/:id', getProductById);

module.exports = router;
