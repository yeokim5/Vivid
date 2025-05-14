// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC90-nlgtcnRXw7PARKkY2RBovPwsYSbE",
  authDomain: "vivid-6d6cd.firebaseapp.com",
  projectId: "vivid-6d6cd",
  storageBucket: "vivid-6d6cd.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: "1:463862134798:web:b005e3598d61bd401b245f",
  measurementId: "G-GDMBPWW5BM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get auth instance
export const auth = getAuth(app);
export default app;
