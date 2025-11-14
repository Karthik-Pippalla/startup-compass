const functions = require('firebase-functions');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initFirebase } = require('./src/config/firebase');
const { seedFunders } = require('./src/utils/bootstrap');
const config = require('./src/config/env');

let bootstrapped = false;
let bootstrapPromise;

const bootstrap = async () => {
  if (bootstrapped) return;
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await connectDB();
      initFirebase();
      await seedFunders();
      bootstrapped = true;
    })();
  }
  return bootstrapPromise;
};

const runtimeOptions = {
  memory: '1GB',
  timeoutSeconds: 540,
};

const region = config.firebase.region || 'us-central1';

const api = functions.region(region).runWith(runtimeOptions).https.onRequest(async (req, res) => {
  await bootstrap();
  return app(req, res);
});

module.exports = { api };
