const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Validate environment variables (especially in production)
const validateEnv = require('./config/validateEnv');
validateEnv();

const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// CORS Middleware - Configured for production and development
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL] 
  : ['http://localhost:3000'];

// Support multiple origins if needed (comma-separated)
const corsOrigins = process.env.FRONTEND_URL?.includes(',')
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : allowedOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Cookie Parser Middleware (required for signed cookies in cookieAuth)
const cookieSecret = process.env.COOKIE_SECRET;
if (!cookieSecret && process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: COOKIE_SECRET environment variable is required in production!');
  process.exit(1);
}
app.use(cookieParser(cookieSecret || 'your-cookie-secret'));

// Session Configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: SESSION_SECRET environment variable is required in production!');
  process.exit(1);
}
app.use(session({
  secret: sessionSecret || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  }
}));

// JSON Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Combined API routes (includes auth routes, products, users, orders, testing) with logging
app.use('/api', require('./routes'));

// Error Handling Middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 Not Found Middleware
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
