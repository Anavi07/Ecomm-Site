const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB connected successfully`);
    console.log(`Database: ${conn.connection.db.databaseName}`);
    console.log(`Host: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    
    // Retry connection after 5 seconds
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
