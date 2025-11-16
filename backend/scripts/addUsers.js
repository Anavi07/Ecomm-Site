require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');

// Users to add
const usersToAdd = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    address: '123 Admin Street',
    phone: '1234567890',
    isActive: true,
  },
  {
    name: 'Vendor 1',
    email: 'vendor1@example.com',
    password: 'vendor123',
    role: 'vendor',
    address: '456 Vendor Lane',
    phone: '1234567891',
    isActive: true,
  },
  {
    name: 'Vendor 2',
    email: 'vendor2@example.com',
    password: 'vendor123',
    role: 'vendor',
    address: '789 Vendor Road',
    phone: '1234567892',
    isActive: true,
  },
  {
    name: 'Customer 1',
    email: 'customer1@example.com',
    password: 'customer123',
    role: 'customer',
    address: '321 Customer Avenue',
    phone: '1234567893',
    isActive: true,
  },
  {
    name: 'Customer 2',
    email: 'customer2@example.com',
    password: 'customer123',
    role: 'customer',
    address: '654 Customer Boulevard',
    phone: '1234567894',
    isActive: true,
  },
  {
    name: 'Customer 3',
    email: 'customer3@example.com',
    password: 'customer123',
    role: 'customer',
    address: '987 Customer Circle',
    phone: '1234567895',
    isActive: true,
  },
];

async function addUsers() {
  try {
    console.log('👥 Adding users to database...\n');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    const addedUsers = [];
    const skippedUsers = [];

    for (const userData of usersToAdd) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists. Skipping...`);
        skippedUsers.push(userData.email);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });

      addedUsers.push({
        email: user.email,
        name: user.name,
        role: user.role,
      });

      console.log(`✅ Added: ${user.name} (${user.email}) - Role: ${user.role}`);
    }

    console.log('\n📊 Summary:');
    console.log(`   - Added: ${addedUsers.length} users`);
    if (skippedUsers.length > 0) {
      console.log(`   - Skipped (already exist): ${skippedUsers.length} users`);
    }

    console.log('\n✨ Users added successfully!');
    console.log('\n📝 Login credentials:');
    addedUsers.forEach((user) => {
      const userData = usersToAdd.find((u) => u.email === user.email);
      console.log(`   ${user.role.toUpperCase()}: ${user.email} / ${userData.password}`);
    });

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding users:', err.message);
    console.error(err.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addUsers();

