// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";

// your firebaseConfig from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC80-ofeALeRh2N-WQpNsW6sSTE_Itnw-s",
  authDomain: "event-calendar-f145e.firebaseapp.com",
  projectId: "event-calendar-f145e",
  storageBucket: "event-calendar-f145e.firebasestorage.app",
  messagingSenderId: "994383053852",
  appId: "1:994383053852:web:e139b2a98cce257c8bcbd9"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager()
  })
});

export { db };
