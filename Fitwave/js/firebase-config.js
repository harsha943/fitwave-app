import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// TODO: Replace with your actual Firebase project configuration from the Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.warn("Firebase not properly configured. Please update firebase-config.js with your credentials.");
}

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

// Re-export required functions for use in db.js
export { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc };
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut };
