const dotenv = require('dotenv');

if (!process.env.FUNCTIONS_EMULATOR && process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/startup-compass',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    region: process.env.FIREBASE_REGION || 'us-central1',
  },
};

module.exports = config;
