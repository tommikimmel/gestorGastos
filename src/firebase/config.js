import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCS4c2RFmQph14Etc52h1-GYWagYRQNx8",
  authDomain: "gestor-gastos-121e2.firebaseapp.com",
  projectId: "gestor-gastos-121e2",
  storageBucket: "gestor-gastos-121e2.firebasestorage.app",
  messagingSenderId: "611441607187",
  appId: "1:611441607187:web:fdeafc3cccb6d1c85575e6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);