const admin = require('firebase-admin');
const config = require('./env');

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp || !config.firebase.projectId) {
    return firebaseApp;
  }

  if (!config.firebase.clientEmail || !config.firebase.privateKey) {
    // eslint-disable-next-line no-console
    console.warn('Firebase credentials missing; skipping Firebase Admin initialization.');
    return null;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });

  return firebaseApp;
};

module.exports = { initFirebase };
