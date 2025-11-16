require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

async function clearDatabase() {
  try {
    console.log('🗑️  Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected\n');

    console.log('🗑️  Clearing all data...');
    
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log(`   Found: ${productCount} products, ${userCount} users, ${orderCount} orders\n`);

    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    console.log('✅ All data cleared successfully!');
    console.log('\n📊 Database is now empty.');

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

clearDatabase();

