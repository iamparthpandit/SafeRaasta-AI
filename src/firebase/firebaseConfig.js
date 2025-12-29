// Firebase Configuration and Initialization
// This file sets up Firebase for the SafeRaasta AI app

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDvOXssDXAZ-WO6-s_IlupPjgCY1PAat0",
  authDomain: "saferaastaai.firebaseapp.com",
  projectId: "saferaastaai",
  storageBucket: "saferaastaai.firebasestorage.app",
  messagingSenderId: "1061233246818",
  appId: "1:1061233246818:web:e98dfeff7b94f7b1ca473b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;
