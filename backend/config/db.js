const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB Atlas connection string format: mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Note: useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 6+ but included for compatibility
      // They are enabled by default in newer versions
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected successfully`);
    console.log(`📦 Database: ${conn.connection.db.databaseName}`);
    console.log(`🌐 Host: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    
    // Retry connection after 5 seconds
    console.log('⏳ Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
