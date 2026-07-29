const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Dog Food', 'Cat Food', 'Puppy Food', 'Kitten Food', 'Treats', 'Supplements', 'Medicines', 'Grooming', 'Toys', 'Accessories', 'Beds', 'Bowls'],
    required: true 
  },
  petType: { type: String, enum: ['Dog', 'Cat', 'Bird', 'Small Pet', 'All'], required: true },
  lifeStage: { type: String, enum: ['Puppy', 'Kitten', 'Adult', 'Senior', 'All Stages'], required: true },
  description: { type: String, required: true },
  ingredients: [{ type: String }],
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0 },
  images: [{ type: String }],
  conditions: [{ type: String }],
  nutritionGoals: [{ type: String }],
  tags: [{ type: String }],
  isRecommended: { type: Boolean, default: false }
}, { timestamps: true });

// Add text index for searching
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
