// Firebase Console → Project settings → Your apps → Web app → "SDK setup and configuration" → Config
// Paste YOUR values below. (These keys are safe to be public; your Firestore rules protect the data.)
window.FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// (ঐচ্ছিক) ভয়েস কল কোনো নেটওয়ার্কে না লাগলে একটি TURN সার্ভার বসান। না লাগলে এটি খালি রাখুন।
// window.TURN_SERVERS = [{ urls: "turn:YOUR_TURN_HOST:80", username: "USER", credential: "PASS" }];
