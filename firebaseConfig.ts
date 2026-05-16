import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-S8g2K2Z3il2xXEvrJfuV5sQHSNPut-Y",
  authDomain: "intvl-chennai-5b210.firebaseapp.com",
  projectId: "intvl-chennai-5b210",
  storageBucket: "intvl-chennai-5b210.firebasestorage.app",
  messagingSenderId: "335501679079",
  appId: "1:335501679079:web:995cab2d2a12af19ad8542"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);