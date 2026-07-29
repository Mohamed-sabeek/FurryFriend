const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const brands = ['Royal Canin', 'Pedigree', 'Drools', 'Farmina', 'Whiskas', 'Sheba', 'Me-O', 'Himalaya', 'Virbac', 'VetLife', 'Kong', 'Trixie', 'Pets Empire', 'PetsPot'];

const generateProducts = () => {
  const products = [];
  
  // Base templates for generation
  const templates = [
    { cat: 'Dog Food', pet: 'Dog', life: 'Adult', desc: 'Premium adult dog food for optimal health.', priceRange: [1500, 4500], img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60', tags: ['dry food', 'adult dog'] },
    { cat: 'Puppy Food', pet: 'Dog', life: 'Puppy', desc: 'Nutritious puppy food for growth and development.', priceRange: [800, 2500], img: 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=500&auto=format&fit=crop&q=60', tags: ['puppy', 'growth', 'dry food'] },
    { cat: 'Cat Food', pet: 'Cat', life: 'Adult', desc: 'Delicious and healthy adult cat food.', priceRange: [1200, 3500], img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=60', tags: ['dry food', 'adult cat', 'hairball control'] },
    { cat: 'Kitten Food', pet: 'Cat', life: 'Kitten', desc: 'High protein kitten food for active little ones.', priceRange: [900, 2800], img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&auto=format&fit=crop&q=60', tags: ['kitten', 'high protein'] },
    { cat: 'Treats', pet: 'Dog', life: 'All Stages', desc: 'Tasty and chewy treats for training and rewards.', priceRange: [150, 600], img: 'https://images.unsplash.com/photo-1623387641177-3140d369a8b1?w=500&auto=format&fit=crop&q=60', tags: ['treats', 'training', 'chews'] },
    { cat: 'Treats', pet: 'Cat', life: 'All Stages', desc: 'Irresistible treats that cats love.', priceRange: [100, 400], img: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=500&auto=format&fit=crop&q=60', tags: ['treats', 'catnip', 'bites'] },
    { cat: 'Supplements', pet: 'Dog', life: 'Senior', desc: 'Joint support and mobility supplements.', priceRange: [500, 2000], img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&auto=format&fit=crop&q=60', tags: ['joints', 'mobility', 'supplements'] },
    { cat: 'Supplements', pet: 'Cat', life: 'All Stages', desc: 'Skin and coat health supplements.', priceRange: [400, 1500], img: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=500&auto=format&fit=crop&q=60', tags: ['skin', 'coat', 'omega 3'] },
    { cat: 'Medicines', pet: 'Dog', life: 'All Stages', desc: 'Flea and tick prevention medication.', priceRange: [300, 1200], img: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?w=500&auto=format&fit=crop&q=60', tags: ['flea', 'tick', 'prevention'] },
    { cat: 'Medicines', pet: 'Cat', life: 'All Stages', desc: 'De-worming tablets for cats.', priceRange: [100, 500], img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&auto=format&fit=crop&q=60', tags: ['dewormer', 'health'] },
    { cat: 'Grooming', pet: 'Dog', life: 'All Stages', desc: 'Hypoallergenic dog shampoo for sensitive skin.', priceRange: [250, 800], img: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&auto=format&fit=crop&q=60', tags: ['shampoo', 'grooming', 'sensitive'] },
    { cat: 'Toys', pet: 'Dog', life: 'All Stages', desc: 'Durable chew toy for heavy chewers.', priceRange: [300, 1500], img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&auto=format&fit=crop&q=60', tags: ['toy', 'chew', 'durable'] },
    { cat: 'Toys', pet: 'Cat', life: 'All Stages', desc: 'Interactive feather wand toy.', priceRange: [150, 600], img: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=500&auto=format&fit=crop&q=60', tags: ['toy', 'interactive', 'feather'] },
    { cat: 'Accessories', pet: 'Dog', life: 'All Stages', desc: 'Adjustable nylon dog collar.', priceRange: [200, 1000], img: 'https://images.unsplash.com/photo-1601758177266-bc5f38eb18b5?w=500&auto=format&fit=crop&q=60', tags: ['collar', 'accessory', 'walk'] },
    { cat: 'Beds', pet: 'Dog', life: 'All Stages', desc: 'Orthopedic memory foam dog bed.', priceRange: [1500, 5000], img: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=60', tags: ['bed', 'sleep', 'orthopedic'] },
    { cat: 'Bowls', pet: 'Cat', life: 'All Stages', desc: 'Stainless steel anti-skid pet bowl.', priceRange: [150, 800], img: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&auto=format&fit=crop&q=60', tags: ['bowl', 'feeding', 'stainless steel'] },
  ];

  const conditionsMap = ['Joint Support', 'Digestive Health', 'Skin & Coat', 'Weight Management', 'Dental Care'];
  const nutritionMap = ['High Protein', 'Grain Free', 'Low Fat', 'Hypoallergenic'];

  let count = 0;
  
  while (count < 65) { // Generating 65 products
    templates.forEach((temp, i) => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const price = Math.floor(Math.random() * (temp.priceRange[1] - temp.priceRange[0]) + temp.priceRange[0]);
      const stock = Math.floor(Math.random() * 100) + 10;
      const rating = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
      
      const conditions = [];
      if(Math.random() > 0.5) conditions.push(conditionsMap[Math.floor(Math.random() * conditionsMap.length)]);
      
      const nutritionGoals = [];
      if(Math.random() > 0.5) nutritionGoals.push(nutritionMap[Math.floor(Math.random() * nutritionMap.length)]);
      
      products.push({
        name: `${brand} ${temp.cat} - ${temp.life} (${count + i})`,
        brand: brand,
        category: temp.cat,
        petType: temp.pet,
        lifeStage: temp.life,
        description: temp.desc,
        ingredients: ['Meat', 'Vitamins', 'Minerals', 'Omega 3'],
        price: price,
        stock: stock,
        rating: Number(rating),
        images: [temp.img],
        conditions: conditions,
        nutritionGoals: nutritionGoals,
        tags: temp.tags,
        isRecommended: Math.random() > 0.8
      });
      count++;
    });
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

    const mockProducts = generateProducts();
    await Product.insertMany(mockProducts);
    
    console.log(`Successfully seeded ${mockProducts.length} products.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
