const mongoose = require('mongoose');

const connectDB = async () => {
const username = 'Nithya';
const password = encodeURIComponent('sxTw_hMfv#37iQh');
const cluster = 'cluster0.z7nbp.mongodb.net';
const dbname = 'drivermap';

const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Cluster0`;


  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

module.exports = connectDB;



