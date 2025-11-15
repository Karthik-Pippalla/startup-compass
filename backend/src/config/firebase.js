const admin = require('firebase-admin');
const path = require('path');
const config = require('./env');

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // For Firebase Functions deployment, use default credentials
    if (process.env.GCLOUD_PROJECT || process.env.FIREBASE_CONFIG) {
      firebaseApp = admin.initializeApp();
    } else {
      // For local development, use the service account key file
      const serviceAccountPath = path.join(__dirname, '../../startup-compass-ai-firebase-adminsdk-fbsvc-e903565a22.json');
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId: config.firebase.projectId,
      });
    }
    
    console.log('Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error.message);
    return null;
  }
};

module.exports = { initFirebase };
