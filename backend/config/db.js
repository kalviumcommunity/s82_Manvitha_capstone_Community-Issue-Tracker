// db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    // Set a timeout of 5 seconds so we don't hang too long on DNS/network errors
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected to Atlas...');
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err.message);
    console.log('Starting local in-memory MongoDB fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`Local in-memory MongoDB started at: ${mongoUri}`);
      await mongoose.connect(mongoUri);
      console.log('MongoDB (In-Memory) Connected...');
    } catch (fallbackErr) {
      console.error('Failed to start in-memory MongoDB:', fallbackErr.message);
      process.exit(1); // Exit process with failure
    }
  }
};

module.exports = connectDB;