import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvgHwgwghFS6mvAZ5140x47anyCs_Q4NU",
  authDomain: "cinepalm-9760d.firebaseapp.com",
  projectId: "cinepalm-9760d",
  storageBucket: "cinepalm-9760d.firebasestorage.app",
  messagingSenderId: "709560155544",
  appId: "1:709560155544:web:af5ca61f9fdf64fc217fed",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
