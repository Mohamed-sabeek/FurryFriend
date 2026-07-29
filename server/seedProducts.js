const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const brands = ['Royal Canin', 'Pedigree', 'Drools', 'Farmina', 'Whiskas', 'Sheba', 'Me-O', 'Himalaya', 'Virbac', 'VetLife', 'Kong', 'Trixie'];

// Upload image from the local filesystem to avoid any CDN blocking issues
const uploadLocalToCloudinary = async (filename, folder = 'petcommerce') => {
  const filePath = path.join(__dirname, 'mock-images', filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Local image not found at ${filePath}`);
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: [
        { width: 800, height: 800, crop: "pad", background: "white" }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload local file ${filename} to Cloudinary. Error:`, error.message);
    return null;
  }
};

const generateProducts = async () => {
  const products = [];
  const templates = [
    { cat: 'Dog Food', pet: 'Dog', life: 'Adult', baseName: 'Premium Adult Dog Food', desc: 'Complete and balanced nutrition for adult dogs. Enriched with Omega 3 & 6.', priceRange: [1500, 4500], tags: ['dry food', 'adult dog', 'premium'], img: 'dog-food.png' },
    { cat: 'Dog Food', pet: 'Dog', life: 'Adult', baseName: 'Weight Care Adult Dog Food', desc: 'Formulated to help adult dogs maintain a healthy weight.', priceRange: [1800, 4800], tags: ['weight', 'adult dog', 'diet'], img: 'dog-food.png' },
    { cat: 'Puppy Food', pet: 'Dog', life: 'Puppy', baseName: 'Healthy Growth Puppy Food', desc: 'High protein nutrition for optimal growth and development in puppies.', priceRange: [800, 2500], tags: ['puppy', 'growth', 'dry food'], img: 'dog-food.png' },
    { cat: 'Cat Food', pet: 'Cat', life: 'Adult', baseName: 'Indoor Adult Cat Food', desc: 'Specially formulated for indoor cats to reduce hairballs and stool odor.', priceRange: [1200, 3500], tags: ['dry food', 'adult cat', 'indoor'], img: 'cat-food.png' },
    { cat: 'Cat Food', pet: 'Cat', life: 'Adult', baseName: 'Renal Support Cat Food', desc: 'Veterinary diet formulated to support renal function in chronic kidney disease.', priceRange: [2000, 4500], tags: ['renal', 'adult cat', 'veterinary diet'], img: 'cat-food.png' },
    { cat: 'Kitten Food', pet: 'Cat', life: 'Kitten', baseName: 'Optimal Growth Kitten Food', desc: 'Nutrient-rich formula for kittens in their first year.', priceRange: [900, 2800], tags: ['kitten', 'high protein', 'growth'], img: 'cat-food.png' },
    { cat: 'Treats', pet: 'Dog', life: 'All Stages', baseName: 'Dental Care Chews', desc: 'Helps reduce tartar buildup and freshen breath.', priceRange: [150, 600], tags: ['treats', 'dental', 'chews'], img: 'treats.png' },
    { cat: 'Treats', pet: 'Cat', life: 'All Stages', baseName: 'Salmon Creamy Treats', desc: 'Irresistible creamy salmon treats that cats love.', priceRange: [100, 400], tags: ['treats', 'salmon', 'creamy'], img: 'treats.png' },
    { cat: 'Supplements', pet: 'Dog', life: 'Senior', baseName: 'Advanced Joint Support', desc: 'Contains Glucosamine and Chondroitin for hip and joint health.', priceRange: [500, 2000], tags: ['joints', 'mobility', 'supplements', 'senior'], img: 'medicine.png' },
    { cat: 'Supplements', pet: 'Cat', life: 'All Stages', baseName: 'Skin & Coat Omega 3', desc: 'Enhances skin health and produces a shiny, soft coat.', priceRange: [400, 1500], tags: ['skin', 'coat', 'omega 3'], img: 'medicine.png' },
    { cat: 'Medicines', pet: 'Dog', life: 'All Stages', baseName: 'Flea & Tick Spot-On', desc: 'Fast-acting, long-lasting flea and tick protection.', priceRange: [300, 1200], tags: ['flea', 'tick', 'prevention'], img: 'medicine.png' },
    { cat: 'Medicines', pet: 'Cat', life: 'All Stages', baseName: 'Broad Spectrum Dewormer', desc: 'Effectively removes common intestinal worms.', priceRange: [100, 500], tags: ['dewormer', 'health'], img: 'medicine.png' },
    { cat: 'Grooming', pet: 'Dog', life: 'All Stages', baseName: 'Hypoallergenic Oatmeal Shampoo', desc: 'Soothing oatmeal shampoo for sensitive skin.', priceRange: [250, 800], tags: ['shampoo', 'grooming', 'sensitive'], img: 'shampoo.png' },
    { cat: 'Grooming', pet: 'Cat', life: 'All Stages', baseName: 'Waterless Foaming Cleanser', desc: 'No-rinse foam for quick and easy cat grooming.', priceRange: [300, 700], tags: ['waterless', 'grooming', 'foam'], img: 'shampoo.png' },
    { cat: 'Toys', pet: 'Dog', life: 'All Stages', baseName: 'Extreme Chew Rubber Toy', desc: 'Ultra-durable rubber toy designed for heavy chewers.', priceRange: [300, 1500], tags: ['toy', 'chew', 'durable'], img: 'toy.png' },
    { cat: 'Toys', pet: 'Cat', life: 'All Stages', baseName: 'Interactive Feather Wand', desc: 'Engaging feather wand to stimulate your cat hunting instincts.', priceRange: [150, 600], tags: ['toy', 'interactive', 'feather'], img: 'toy.png' },
    { cat: 'Accessories', pet: 'Dog', life: 'All Stages', baseName: 'Reflective Nylon Harness', desc: 'Comfortable, adjustable harness with reflective strips for night walks.', priceRange: [400, 1500], tags: ['harness', 'accessory', 'walk'], img: 'accessory.png' },
    { cat: 'Accessories', pet: 'Cat', life: 'All Stages', baseName: 'Ergonomic Ceramic Bowl', desc: 'Whisker-friendly ceramic bowl for comfortable feeding.', priceRange: [200, 800], tags: ['bowl', 'feeding', 'ceramic'], img: 'accessory.png' }
  ];

  const conditionsMap = ['Joint Support', 'Digestive Health', 'Skin & Coat', 'Weight Management', 'Dental Care'];
  const nutritionMap = ['High Protein', 'Grain Free', 'Low Fat', 'Hypoallergenic'];
  const sizeMap = ['1.5kg', '3kg', '10kg', '200ml', '500ml', 'Small', 'Large'];

  console.log('Uploading ultra-realistic packshots to Cloudinary...');
  
  // Cache the Cloudinary URLs for each local image file so we only upload 7 times.
  const cloudinaryUrls = {};
  const imageFiles = ['dog-food.png', 'cat-food.png', 'medicine.png', 'shampoo.png', 'toy.png', 'treats.png', 'accessory.png'];
  
  for (const file of imageFiles) {
    const secureUrl = await uploadLocalToCloudinary(file);
    if (!secureUrl) {
       console.error(`FATAL: Could not get a valid Cloudinary URL for ${file}. Aborting generation.`);
       process.exit(1);
    }
    cloudinaryUrls[file] = secureUrl;
    console.log(`Successfully mapped ${file} -> ${secureUrl}`);
  }

  for (const template of templates) {
    let multiplier = 4;
    if (template.cat.includes('Food')) multiplier = 7;
    if (template.cat === 'Treats' || template.cat === 'Grooming') multiplier = 5;
    
    for (let i = 0; i < multiplier; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const size = sizeMap[Math.floor(Math.random() * sizeMap.length)];
      const price = Math.floor(Math.random() * (template.priceRange[1] - template.priceRange[0]) + template.priceRange[0]);
      const stock = Math.floor(Math.random() * 100) + 10;
      const rating = (Math.random() * (5 - 3.8) + 3.8).toFixed(1);
      
      const conditions = [];
      if(Math.random() > 0.6) conditions.push(conditionsMap[Math.floor(Math.random() * conditionsMap.length)]);
      
      const nutritionGoals = [];
      if(Math.random() > 0.6) nutritionGoals.push(nutritionMap[Math.floor(Math.random() * nutritionMap.length)]);
      
      const productName = `${brand} ${template.baseName}`;
      const fullName = `${productName} (${size})`;
      
      // Look up the permanently cached Cloudinary URL from our highly realistic pre-uploads
      const secureUrl = cloudinaryUrls[template.img];

      products.push({
        name: fullName,
        brand: brand,
        category: template.cat,
        petType: template.pet,
        lifeStage: template.life,
        description: template.desc,
        ingredients: template.cat.includes('Food') ? ['Chicken', 'Rice', 'Vitamins', 'Minerals', 'Omega 3'] : [],
        price: price,
        stock: stock,
        rating: Number(rating),
        images: [secureUrl],
        conditions: conditions,
        nutritionGoals: nutritionGoals,
        tags: template.tags,
        isRecommended: Math.random() > 0.8
      });
    }
  }

  return products;
};

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for Seeding Products...');

    await Product.deleteMany();
    console.log('Cleared existing products.');

    const mockProducts = await generateProducts();
    
    // Final Validation exactly as requested
    const validatedProducts = mockProducts.filter(p => p.images && p.images[0] && p.images[0].startsWith('http'));
    
    if (validatedProducts.length !== mockProducts.length) {
       console.error(`Validation Failed: ${mockProducts.length - validatedProducts.length} products have missing or invalid URLs.`);
    }

    await Product.insertMany(validatedProducts);
    
    console.log(`Successfully seeded ${validatedProducts.length} hyper-realistic products directly integrated with Cloudinary.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
