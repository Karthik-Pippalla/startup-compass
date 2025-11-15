const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
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

// Set global options for all functions
setGlobalOptions({ 
  region: config.firebase.region || 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 540
});

const api = onRequest(async (req, res) => {
  await bootstrap();
  return app(req, res);
});

module.exports = { api };
