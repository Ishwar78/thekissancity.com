const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/thekissan';
  const localUri = 'mongodb://127.0.0.1:27017/thekissan';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (primaryError) {
    console.warn(`⚠️ Primary MongoDB connection failed (${primaryError.message}). Trying local MongoDB...`);
    try {
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ Connected to Local MongoDB: ${conn.connection.host}`);
    } catch (localError) {
      console.error(`❌ MongoDB Connection Error: Could not connect to Atlas or Local MongoDB.`);
      console.error(`Please check your internet connection or start local MongoDB service.`);
    }
  }
};

module.exports = connectDB;
