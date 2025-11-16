require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const connectDB = require('../config/db');

const sampleProducts = [
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
      'https://www.portronics.com/cdn/shop/products/Modesk-1.jpg?v=1647446052',
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
      'https://images.unsplash.com/photo-1602025882379-e01cf08baa51?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
  },
];

async function seedDatabase() {
  try {
    await connectDB();

    // Check if --force flag is passed
    const forceReseed = process.argv.includes('--force');

    if (forceReseed) {
      console.log('Clearing existing products...');
      await Product.deleteMany({});
    } else {
      const count = await Product.countDocuments();
      if (count > 0) {
        console.log(`✓ Database already has ${count} products. Use --force to overwrite.`);
        process.exit(0);
      }
    }

    console.log('Inserting sample products...');
    const inserted = await Product.insertMany(sampleProducts);

    console.log(`✓ Successfully seeded ${inserted.length} products!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
}

seedDatabase();
