// Firebase App, Auth & Realtime Database Configuration

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const isConfigured = apiKey && !apiKey.startsWith('your-') && apiKey.length > 20;

let auth = null;
let googleProvider = null;
let rtdb = null;

if (isConfigured) {
  try {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hokka-41da8';
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
    };
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    rtdb = getDatabase(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (e) {
    console.warn('[Hokka] Firebase başlatılamadı:', e.message);
  }
}

export const firebaseConfigured = isConfigured && auth !== null && rtdb !== null;
export { auth, googleProvider, rtdb };
