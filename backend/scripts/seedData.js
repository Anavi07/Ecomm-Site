require('dotenv').config();
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Categories for products
const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Sports & Outdoors'];

/**
 * Generate sample products with faker data
 */
function generateProducts(vendors, count = 20) {
  const products = [];
  const productsPerCategory = Math.ceil(count / categories.length);

  categories.forEach((category, categoryIndex) => {
    for (let i = 0; i < productsPerCategory && products.length < count; i++) {
      // Assign vendor - rotate through vendors
      const vendor = vendors[categoryIndex % vendors.length];

      products.push({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 100, max: 50000, dec: 2 })),
        category: category,
        stock: faker.number.int({ min: 0, max: 200 }),
        images: [
          faker.image.urlLoremFlickr({ width: 500, height: 500, category: 'product' }),
        ],
        ratings: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
        vendor: vendor._id,
      });
    }
  });

  return products;
}

/**
 * Generate sample users
 */
async function generateUsers() {
  const users = [];

  // 1 Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  users.push({
    name: 'Admin User',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin',
    address: faker.location.streetAddress(),
    phone: faker.phone.number(),
    isActive: true,
  });

  // 2 Vendors
  for (let i = 0; i < 2; i++) {
    const vendorPassword = await bcrypt.hash('vendor123', 10);
    users.push({
      name: faker.person.fullName(),
      email: `vendor${i + 1}@example.com`,
      password: vendorPassword,
      role: 'vendor',
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
      isActive: true,
    });
  }

  // 3 Customers
  for (let i = 0; i < 3; i++) {
    const customerPassword = await bcrypt.hash('customer123', 10);
    users.push({
      name: faker.person.fullName(),
      email: `customer${i + 1}@example.com`,
      password: customerPassword,
      role: 'customer',
      address: faker.location.streetAddress(),
      phone: faker.phone.number(),
      isActive: true,
    });
  }

  return users;
}

/**
 * Generate sample orders
 */
function generateOrders(customers, products) {
  const orders = [];
  const orderStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
  const paymentStatuses = ['pending', 'paid', 'failed'];
  const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'];

  // Generate 10-15 orders
  const orderCount = faker.number.int({ min: 10, max: 15 });

  for (let i = 0; i < orderCount; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const orderItemCount = faker.number.int({ min: 1, max: 4 });
    const orderItems = [];

    let totalPrice = 0;

    // Generate order items
    for (let j = 0; j < orderItemCount; j++) {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const price = product.price;

      orderItems.push({
        product: product._id,
        quantity: quantity,
        price: price,
      });

      totalPrice += price * quantity;
    }

    const orderStatus = faker.helpers.arrayElement(orderStatuses);
    const paymentStatus = faker.helpers.arrayElement(paymentStatuses);
    const paymentMethod = faker.helpers.arrayElement(paymentMethods);

    orders.push({
      user: customer._id,
      orderItems: orderItems,
      shippingAddress: {
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      orderStatus: orderStatus,
      totalPrice: totalPrice,
      createdAt: faker.date.past({ years: 1 }),
    });
  }

  return orders;
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB Atlas
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas\n');

    // Check if --force flag is passed
    const forceReseed = process.argv.includes('--force');

    if (forceReseed) {
      console.log('🗑️  Clearing existing data...');
      await Product.deleteMany({});
      await User.deleteMany({});
      await Order.deleteMany({});
      console.log('✅ Cleared all collections\n');
    } else {
      const productCount = await Product.countDocuments();
      const userCount = await User.countDocuments();
      const orderCount = await Order.countDocuments();

      if (productCount > 0 || userCount > 0 || orderCount > 0) {
        console.log(`⚠️  Database already has data:`);
        console.log(`   - Products: ${productCount}`);
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Orders: ${orderCount}`);
        console.log(`\n💡 Use --force flag to overwrite existing data.\n`);
        process.exit(0);
      }
    }

    // Step 1: Generate and insert users
    console.log('👥 Generating users...');
    const userData = await generateUsers();
    const insertedUsers = await User.insertMany(userData);
    console.log(`✅ Inserted ${insertedUsers.length} users:`);
    console.log(`   - 1 Admin (admin@example.com / admin123)`);
    console.log(`   - 2 Vendors (vendor1@example.com, vendor2@example.com / vendor123)`);
    console.log(`   - 3 Customers (customer1@example.com, customer2@example.com, customer3@example.com / customer123)\n`);

    // Get vendors for product assignment
    const vendors = insertedUsers.filter((u) => u.role === 'vendor');
    const customers = insertedUsers.filter((u) => u.role === 'customer');

    // Step 2: Generate and insert products
    console.log('📦 Generating products...');
    const productData = generateProducts(vendors, 20);
    const insertedProducts = await Product.insertMany(productData);
    console.log(`✅ Inserted ${insertedProducts.length} products across ${categories.length} categories:\n`);
    categories.forEach((cat) => {
      const count = insertedProducts.filter((p) => p.category === cat).length;
      console.log(`   - ${cat}: ${count} products`);
    });
    console.log('');

    // Step 3: Generate and insert orders
    console.log('🛒 Generating orders...');
    const orderData = generateOrders(customers, insertedProducts);
    const insertedOrders = await Order.insertMany(orderData);
    console.log(`✅ Inserted ${insertedOrders.length} orders with various statuses:\n`);

    // Count orders by status
    const statusCounts = {};
    insertedOrders.forEach((order) => {
      statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count} orders`);
    });
    console.log('');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${insertedUsers.length}`);
    console.log(`   - Products: ${insertedProducts.length}`);
    console.log(`   - Orders: ${insertedOrders.length}`);
    console.log('\n✨ You can now start using the application!');

    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    console.error(err.stack);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run seeding
seedDatabase();

