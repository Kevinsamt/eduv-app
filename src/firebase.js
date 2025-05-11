import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration for eduv-app
// Replace these values with the ones from your Firebase Console
// Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual API key
  authDomain: "eduv-app.firebaseapp.com", // Replace with your actual auth domain
  projectId: "eduv-app", // This should match your project ID
  storageBucket: "eduv-app.appspot.com", // Replace with your actual storage bucket
  messagingSenderId: "123456789", // Replace with your actual sender ID
  appId: "1:123456789:web:abcdef" // Replace with your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 