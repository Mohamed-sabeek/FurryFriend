const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const GroomingCenter = require('./models/GroomingCenter');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'furryfriend_grooming',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Upload failed for:', filePath, error);
    return null;
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // The two generated images
    const catImage = 'C:\\Users\\A S U S\\.gemini\\antigravity-ide\\brain\\2eb613c5-6d6a-4258-919c-52d8dd21015e\\cat_grooming_1785348323446.png';
    const dogSpaImage = 'C:\\Users\\A S U S\\.gemini\\antigravity-ide\\brain\\2eb613c5-6d6a-4258-919c-52d8dd21015e\\luxury_dog_spa_1785348335801.png';

    console.log('Uploading Cat Salon image...');
    const catUrl = await uploadImage(catImage);
    
    console.log('Uploading Dog Spa image...');
    const dogSpaUrl = await uploadImage(dogSpaImage);

    if (catUrl) {
      await GroomingCenter.updateOne({ name: 'Purrfect Style Salon' }, { images: [catUrl] });
      console.log('Updated Purrfect Style Salon');
    }
    
    if (dogSpaUrl) {
      await GroomingCenter.updateOne({ name: 'Wags & Whiskers Spa' }, { images: [dogSpaUrl] });
      console.log('Updated Wags & Whiskers Spa');
    }

    console.log('Done!');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
};

run();
