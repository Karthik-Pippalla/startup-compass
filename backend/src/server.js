const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');
const { initFirebase } = require('./config/firebase');
const { seedFunders } = require('./utils/bootstrap');

const start = async () => {
  try {
    await connectDB();
    initFirebase();
    await seedFunders();

    app.listen(config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on port ${config.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
