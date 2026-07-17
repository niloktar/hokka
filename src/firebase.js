// Firebase App & Auth Configuration
// Config değerleri placeholder ise Firebase başlatılmaz → uygulama anonim modda çalışır.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const isConfigured = apiKey && !apiKey.startsWith('your-') && apiKey.length > 20;

let auth = null;
let googleProvider = null;

if (isConfigured) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (e) {
    console.warn('[Hokka] Firebase başlatılamadı:', e.message);
  }
}

export const firebaseConfigured = isConfigured && auth !== null;
export { auth, googleProvider };
