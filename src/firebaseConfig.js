// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Google Config
export const googleConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: process.env.REACT_APP_GOOGLE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_GOOGLE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_GOOGLE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_GOOGLE_APP_ID,
};

// Microsoft Config
export const microsoftConfig = {
  apiKey: process.env.REACT_APP_MICROSOFT_API_KEY,
  authDomain: process.env.REACT_APP_MICROSOFT_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_MICROSOFT_PROJECT_ID,
  storageBucket: process.env.REACT_APP_MICROSOFT_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MICROSOFT_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_MICROSOFT_APP_ID,
  measurementId: process.env.REACT_APP_MICROSOFT_MEASUREMENT_ID,
};

// Database Config
export const dbConfig = {
  apiKey: process.env.REACT_APP_DB_API_KEY,
  authDomain: process.env.REACT_APP_DB_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DB_DATABASE_URL,
  projectId: process.env.REACT_APP_DB_PROJECT_ID,
  storageBucket: process.env.REACT_APP_DB_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_DB_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_DB_APP_ID,
};

// Applications Config
export const applicationsConfig = {
  apiKey: process.env.REACT_APP_APPS_API_KEY,
  authDomain: process.env.REACT_APP_APPS_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_APPS_DATABASE_URL,
  projectId: process.env.REACT_APP_APPS_PROJECT_ID,
  storageBucket: process.env.REACT_APP_APPS_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_APPS_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APPS_APP_ID,
};

  // Initialize Firebase

  



// Initialize Google Firebase
const googleApp = initializeApp(googleConfig);
const googleAuth = getAuth(googleApp);
const google_db = getDatabase(googleApp);


// Initialize Microsoft Firebase
const microsoftApp = initializeApp(microsoftConfig, "microsoftApp");
const microsoftAuth = getAuth(microsoftApp);
const microsoft_db = getDatabase(microsoftApp);

const appliactions_app = initializeApp(applicationsConfig, "applications_app");
const applications_db = getDatabase(appliactions_app);


const databaseApp = initializeApp(dbConfig, "databaseApp");
const db = getDatabase(databaseApp);

export {  googleAuth, google_db, microsoftAuth, microsoft_db,db, applications_db };
