require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const connectDB = require('../config/db');

// Original products from seedProducts.js
const originalProducts = [
  {
    name: 'Laptop Pro 15',
    description: 'High-performance laptop with 16GB RAM and 512GB SSD.',
    price: 89999,
    category: 'Electronics',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    ],
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling Bluetooth headphones with 30h battery life.',
    price: 12999,
    category: 'Electronics',
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    ],
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor.',
    price: 24999,
    category: 'Electronics',
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    ],
  },
  {
    name: 'USB-C Cable',
    description: 'Durable 2-meter USB-C charging and data cable.',
    price: 599,
    category: 'Accessories',
    stock: 200,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
    ],
  },
  {
    name: 'Portable Charger',
    description: '20000mAh portable battery with dual USB ports.',
    price: 2999,
    category: 'Accessories',
    stock: 80,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
    ],
  },
  {
    name: 'Phone Stand',
    description: 'Adjustable desktop phone stand for all devices.',
    price: 399,
    category: 'Accessories',
    stock: 120,
    images: [
      '/images/phone-stand.jpg',
    ],
  },
  {
    name: 'Gaming Mouse',
    description: '16000 DPI gaming mouse with RGB lighting.',
    price: 2499,
    category: 'Electronics',
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
    ],
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with Cherry MX switches.',
    price: 8999,
    category: 'Electronics',
    stock: 30,
    images: [
      '/images/mechanical-keyboard.jpg',
    ],
  },
];

async function restoreOriginal() {
  try {
    console.log('🔄 Restoring original products...\n');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Clear any existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products\n');

    // Insert original products
    // Note: Products need a vendor field, so we'll need to create a default vendor or use an existing one
    // For now, let's check if there are any users with vendor role
    const User = require('../models/User');
    let vendor = await User.findOne({ role: 'vendor' });
    
    // If no vendor exists, we'll need to create one or use admin
    if (!vendor) {
      vendor = await User.findOne({ role: 'admin' });
      if (!vendor) {
        console.log('⚠️  No vendor or admin user found. Products need a vendor field.');
        console.log('💡 Creating a temporary vendor user...\n');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('temp123', 10);
        vendor = await User.create({
          name: 'Default Vendor',
          email: 'vendor@example.com',
          password: hashedPassword,
          role: 'vendor',
        });
      }
    }

    // Add vendor to each product
    const productsWithVendor = originalProducts.map(product => ({
      ...product,
      vendor: vendor._id,
    }));

    const inserted = await Product.insertMany(productsWithVendor);
    console.log(`✅ Restored ${inserted.length} original products!\n`);
    
    console.log('📦 Products restored:');
    inserted.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ₹${p.price}`);
    });

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error restoring data:', err.message);
    console.error(err.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

restoreOriginal();

