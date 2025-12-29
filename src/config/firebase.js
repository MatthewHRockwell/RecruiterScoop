// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDCmNjPM2avnmrw9qOGB_7S7zG4l0AuHqc",
  authDomain: "recruiterscoop.firebaseapp.com",
  projectId: "recruiterscoop",
  storageBucket: "recruiterscoop.firebasestorage.app",
  messagingSenderId: "850975692966",
  appId: "1:850975692966:web:3f5ca72035f508a8adbc67",
  measurementId: "G-8PD21B2XYQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const appId = 'recruiter-scoop';