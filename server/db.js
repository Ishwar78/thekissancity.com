const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4 DNS lookup order to prevent Node.js Windows SRV timeouts
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // Ignore if not supported in older Node
}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/thekissan';
  const localUri = 'mongodb://127.0.0.1:27017/thekissan';

  const connectOptions = {
    serverSelectionTimeoutMS: 10000,
    family: 4, // Force IPv4
  };

  try {
    const conn = await mongoose.connect(primaryUri, connectOptions);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (primaryError) {
    console.warn(`⚠️ Primary MongoDB connection attempt failed: ${primaryError.message}`);

    // If SRV DNS lookup failed on Windows (querySrv ECONNREFUSED), switch to Google DNS and retry Atlas once
    if (
      primaryError.message &&
      (primaryError.message.includes('querySrv') ||
        primaryError.message.includes('ECONNREFUSED') ||
        primaryError.message.includes('ENOTFOUND'))
    ) {
      try {
        console.log(`🔄 Retrying MongoDB Atlas connection using Google Public DNS (8.8.8.8)...`);
        dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
        const conn = await mongoose.connect(primaryUri, connectOptions);
        console.log(`✅ MongoDB Connected via Fallback DNS: ${conn.connection.host}`);
        return;
      } catch (retryErr) {
        console.warn(`⚠️ DNS Fallback retry also failed: ${retryErr.message}`);
      }
    }

    // Fallback to local MongoDB if Atlas connection fails
    console.warn(`Trying local MongoDB service fallback...`);
    try {
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ Connected to Local MongoDB: ${conn.connection.host}`);
    } catch (localError) {
      console.error(`❌ MongoDB Connection Error: Could not connect to MongoDB Atlas or Local MongoDB.`);
      console.error(`👉 Troubleshooting steps:`);
      console.error(`1. Check your Internet connection.`);
      console.error(`2. Ensure MongoDB Atlas IP Whitelist includes '0.0.0.0/0' (Allow access from anywhere).`);
      console.error(`3. If using local MongoDB, make sure MongoDB service is running on 127.0.0.1:27017.`);
    }
  }
};

module.exports = connectDB;
