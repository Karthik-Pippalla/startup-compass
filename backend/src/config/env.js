const dotenv = require('dotenv');

// Only load .env in local development, not during Firebase Functions deployment
const isFirebaseDeploy = process.env.GCLOUD_PROJECT || process.env.FIREBASE_CONFIG;
const isEmulator = process.env.FUNCTIONS_EMULATOR;

if (!isFirebaseDeploy && !isEmulator && process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT || process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/startup-compass',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  firebase: {
    projectId: process.env.GCLOUD_PROJECT || 'startup-compass-ai',
    region: process.env.APP_REGION || 'us-central1',
  },
};

module.exports = config;
