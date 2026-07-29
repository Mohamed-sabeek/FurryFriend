const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const PLACEHOLDER_IMAGE = "https://placehold.co/800x800/f8fafc/94a3b8?text=No+Product+Image";

const checkUrlValid = (url) => {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    
    // Quick validation format without heavy HTTP requests for every single image
    try {
      new URL(url);
      resolve(true);
    } catch(e) {
      resolve(false);
    }
  });
};

const validateProducts = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected. Validating Products...');

    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      const validImages = [];

      if (!product.images || product.images.length === 0) {
        validImages.push(PLACEHOLDER_IMAGE);
        needsUpdate = true;
      } else {
        for (const img of product.images) {
          const isValid = await checkUrlValid(img);
          if (isValid) {
            validImages.push(img);
          } else {
            needsUpdate = true;
          }
        }
        
        if (validImages.length === 0) {
          validImages.push(PLACEHOLDER_IMAGE);
        }
      }

      if (needsUpdate) {
        product.images = validImages;
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Validation complete. Updated ${updatedCount} products with missing or invalid image URLs.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

validateProducts();
