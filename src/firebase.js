import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4B9B7SzxeWC7h3tYXOu5TL0nGbbBH0rQ",
  authDomain: "sistema-de-produccion-tm.firebaseapp.com",
  projectId: "sistema-de-produccion-tm",
  storageBucket: "sistema-de-produccion-tm.firebasestorage.app",
  messagingSenderId: "357709452276",
  appId: "1:357709452276:web:f3bdf0aa8f7faa63409fa1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
