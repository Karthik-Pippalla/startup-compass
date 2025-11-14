const mongoose = require('mongoose');
const config = require('./env');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(config.mongoUri, {
      autoIndex: false,
    });

    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', error);
    throw error;
  }
};

module.exports = connectDB;
