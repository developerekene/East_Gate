import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBiMIbVyYnEN94MuJVLQPSHd0QWHxeFL-Q",
  authDomain: "systems-0ne.firebaseapp.com",
  projectId: "systems-0ne",
  storageBucket: "systems-0ne.firebasestorage.app",
  messagingSenderId: "172003627306",
  appId: "1:172003627306:web:068e88235be8e6f6bc8e53",
  measurementId: "G-65E21C4W5X"
};

// Initialize Firebase safely for SSR/reloading
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const SUPER_ADMIN_EMAIL = 'ekenehq@gmail.com';

export const isSuperAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
};

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
};
export type { FirebaseUser };
