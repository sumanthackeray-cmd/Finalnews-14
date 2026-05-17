import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCC81u4VhjmLFYdww8xmcisUQ-4swqMXsQ",
  authDomain: "vogats-firebase-studio.firebaseapp.com",
  databaseURL: "https://vogats-firebase-studio-default-rtdb.firebaseio.com",
  projectId: "vogats-firebase-studio",
  storageBucket: "vogats-firebase-studio.firebasestorage.app",
  messagingSenderId: "495963475897",
  appId: "1:495963475897:web:80d7456b72e381bb80b068",
  measurementId: "G-J0XRK9CTMW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use the existing 'vogats-news' database instance
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    databaseId: "vogats-news"
  });
} catch (e) {
  dbInstance = getFirestore(app, "vogats-news");
}

export const db = dbInstance;
export default app;
