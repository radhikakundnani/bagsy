const mongoose = require('mongoose');
const dns = require('dns');

// Some home/mobile networks can't answer the special DNS lookup that
// mongodb+srv:// links need (error: querySrv EBADRESP).
// Ask Google and Cloudflare's public DNS servers instead.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async (retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;
