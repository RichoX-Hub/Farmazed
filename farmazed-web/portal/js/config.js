/**
 * Farmazed Portal — Configuration
 * 
 * ⚠️  DEVELOPER TOUCHPOINT #1
 * Fill in your Firebase project config below.
 * Get it from: Firebase Console → Project Settings → General → Your apps → SDK setup
 */
const FIREBASE_CONFIG = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "farmazed.firebaseapp.com",
  projectId:         "farmazed",
  storageBucket:     "farmazed.appspot.com",
  messagingSenderId: "REPLACE_WITH_SENDER_ID",
  appId:             "REPLACE_WITH_APP_ID",
};

/**
 * ⚠️  DEVELOPER TOUCHPOINT #2
 * API base URL — set to your deployed Cloud Run URL or localhost for dev.
 */
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8080'
  : 'https://api.farmazed.com';   // update after deploying tracker/ to Cloud Run

export { FIREBASE_CONFIG, API_BASE };
