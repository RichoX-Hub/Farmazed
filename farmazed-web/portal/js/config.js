/**
 * Farmazed Portal — Configuration
 * 
 * ⚠️  DEVELOPER TOUCHPOINT #1
 * Fill in your Firebase project config below.
 * Get it from: Firebase Console → Project Settings → General → Your apps → SDK setup
 */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDVsZxaNW48VFF68bz-SYnOwzR6O6Fio_o",
  authDomain:        "farmazed.firebaseapp.com",
  projectId:         "farmazed",
  storageBucket:     "farmazed.firebasestorage.app",
  messagingSenderId: "267037695065",
  appId:             "1:267037695065:web:d2d8864b539b3b9469a548",
};

/**
 * ⚠️  DEVELOPER TOUCHPOINT #2
 * API base URL — set to your deployed Cloud Run URL or localhost for dev.
 */
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : 'https://api.farmazed.com';   // update after deploying tracker/ to Cloud Run

export { FIREBASE_CONFIG, API_BASE };
