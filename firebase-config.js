// Firebase Console → Project settings → Your apps → Web app → "SDK setup and configuration" → Config
// Paste YOUR values below. (These keys are safe to be public; your Firestore rules protect the data.)
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCfJ0l5RwpDGuplJezd0jMgmtwX0VTLLnE",
  authDomain: "jomidar.firebaseapp.com",
  projectId: "jomidar",
  storageBucket: "jomidar.firebasestorage.app",
  messagingSenderId: "27954103088",
  appId: "1:27954103088:web:00ae9ed99d56ec5a773ef5"
};

// (ঐচ্ছিক) ভয়েস কল কোনো নেটওয়ার্কে না লাগলে একটি TURN সার্ভার বসান। না লাগলে এটি খালি রাখুন।
// window.TURN_SERVERS = [{ urls: "turn:YOUR_TURN_HOST:80", username: "USER", credential: "PASS" }];

// (ঐচ্ছিক) ফ্রি-টিয়ার সীমা — না দিলে নিচের ডিফল্ট চলবে। বাড়ালে firestore.rules-এ meta/live-এর সীমাও (10 রুম / 40 খেলা) দেখে নিন।
// window.APP_LIMITS = { rooms: 8,      // একসাথে সর্বোচ্চ চালু খেলা (রুম)
//                       perDay: 20,    // দিনে (প্যাসিফিক সময়ে) সর্বোচ্চ কয়টি অনলাইন খেলা শুরু হবে
//                       stale: 12,     // এত মিনিট সাড়া না এলে রুম "মৃত" ধরে স্লট ছেড়ে দেওয়া হয়
//                       watch: 12,     // দর্শকের লাইভ দেখা এত মিনিট পর নিজে থেকে থামে
//                       hb: 4 };       // রুমের হার্টবিট (মিনিট)
