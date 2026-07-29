const Product = require('../models/Product');
const Pet = require('../models/Pet');
const NutritionPlan = require('../models/NutritionPlan');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, search, recommended } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (recommended === 'true') {
      query.isRecommended = true;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get recommended products for a pet based on AI cache
// @route   GET /api/products/recommended/:petId
// @access  Private
exports.getRecommendedProductsForPet = async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Fetch Pet
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Fetch Nutrition Plan
    const nutritionPlan = await NutritionPlan.findOne({ pet: petId }).sort({ createdAt: -1 });

    let searchKeywords = [];

    // Extract from Pet Health Summary Cache
    if (pet.aiSummaryCached && pet.aiSummaryCached.summary) {
      const summary = pet.aiSummaryCached.summary;
      // Depending on the structure of the AI response...
      if (summary.recommendedMedicines) {
        searchKeywords.push(...summary.recommendedMedicines);
      }
      if (summary.recommendedSupplements) {
        searchKeywords.push(...summary.recommendedSupplements);
      }
      if (summary.keyIssues) {
         searchKeywords.push(...summary.keyIssues);
      }
    }

    // Add Pet's medical conditions explicitly
    if (pet.medicalConditions) {
      searchKeywords.push(...pet.medicalConditions.split(',').map(c => c.trim()));
    }

    // Extract from Nutrition Plan Cache
    if (nutritionPlan && nutritionPlan.planData) {
      const data = nutritionPlan.planData;
      if (data.recommendedFoods) {
        searchKeywords.push(...data.recommendedFoods.map(f => typeof f === 'object' ? f.name : f));
      }
      if (data.recommendedTreats) {
        searchKeywords.push(...data.recommendedTreats);
      }
      if (data.nutritionGoals) {
        searchKeywords.push(...data.nutritionGoals);
      }
    }

    searchKeywords = searchKeywords.filter(k => k && typeof k === 'string');

    if (searchKeywords.length === 0) {
      // Return general recommendations if no specific keywords
      const defaultProducts = await Product.find({ isRecommended: true, petType: pet.species }).limit(10);
      return res.status(200).json({ recommended: defaultProducts, reason: 'General Recommendations' });
    }

    // Create regex patterns for matching
    const regexPatterns = searchKeywords.map(keyword => new RegExp(keyword, 'i'));

    // Match products based on name, conditions, nutritionGoals, tags
    const recommendedProducts = await Product.find({
      $and: [
        { petType: { $in: [pet.species, 'All'] } },
        {
          $or: [
            { name: { $in: regexPatterns } },
            { conditions: { $in: regexPatterns } },
            { nutritionGoals: { $in: regexPatterns } },
            { tags: { $in: regexPatterns } }
          ]
        }
      ]
    }).limit(12);

    // If still no matches, fallback
    if (recommendedProducts.length === 0) {
      const fallbackProducts = await Product.find({ isRecommended: true, petType: pet.species }).limit(10);
      return res.status(200).json({ recommended: fallbackProducts, reason: 'General Recommendations based on pet type' });
    }

    res.status(200).json({ recommended: recommendedProducts, reason: 'Personalized based on AI health and nutrition summaries' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
