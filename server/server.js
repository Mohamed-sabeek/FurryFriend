const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const petRoutes = require('./routes/petRoutes');
const vetRoutes = require('./routes/vetRoutes');
const aiRoutes = require('./routes/aiRoutes');
const mapsRoutes = require('./routes/mapsRoutes');
const healthRecordRoutes = require('./routes/healthRecordRoutes');
const nutritionRoutes = require('./routes/nutriRoutes');
const waterRoutes = require('./routes/waterRoutes');
const boardingRoutes = require('./routes/boardingRoutes');
const travelPawsRoutes = require('./routes/travelPawsRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const groomingRoutes = require('./routes/groomingRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Set security headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compress responses
app.use(compression());

// Parse JSON and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again in 15 minutes'
});
app.use('/api', limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/vet', vetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/health-records', healthRecordRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/grooming', groomingRoutes);
app.use('/api/boarding', boardingRoutes);
app.use('/api/travelpaws', travelPawsRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/clinic', clinicRoutes);
app.use('/api/emergency', emergencyRoutes);

// 404 handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
