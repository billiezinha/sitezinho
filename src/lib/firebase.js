import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBtxzWGOEcal6t9slnOqvn8gJDYOY1L3zM",
  authDomain: "paralamourdemavie.firebaseapp.com",
  projectId: "paralamourdemavie",
  storageBucket: "paralamourdemavie.firebasestorage.app",
  messagingSenderId: "991550170522",
  appId: "1:991550170522:web:b8139be8cf6cbb2a250623",
  measurementId: "G-1DKX4T4BM7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);