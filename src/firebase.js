import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA9tUi7GALBDWvZA20Fz7P1NNBW_cfbxdk",
  authDomain: "reporte-de-errores-rx.firebaseapp.com",
  projectId: "reporte-de-errores-rx",
  storageBucket: "reporte-de-errores-rx.firebasestorage.app",
  messagingSenderId: "851330297843",
  appId: "1:851330297843:web:0708a7c36867224679ac86"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
