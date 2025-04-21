// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Config for Google
const googleConfig = {
  apiKey: "AIzaSyDPrCgc4hTSO8am7LFi6KasGo7vCISXV9U",
  authDomain: "authenticate-13e26.firebaseapp.com",
  projectId: "authenticate-13e26",
  storageBucket: "authenticate-13e26.appspot.com",
  messagingSenderId: "839678165187",
  appId: "1:839678165187:web:962a4613e2ad62c81ea276",
};

// Config for Microsoft
const microsoftConfig = {
  apiKey: "AIzaSyD27cvVjz9oBqf6aysk4Tn8uBzZLxSJFU4",
  authDomain: "freelancer-771b9.firebaseapp.com",
  projectId: "freelancer-771b9",
  storageBucket: "freelancer-771b9.appspot.com",
  messagingSenderId: "246641148741",
  appId: "1:246641148741:web:bfe70c74d8b6b684af742c",
  measurementId: "G-0S2XLNZX08"
};

//Database config
const dbConfig = {
  apiKey: "AIzaSyAGwwANPLd68tL8NEMpYQidEaPWHAcEi3Y",
  authDomain: "clientjobs-21ada.firebaseapp.com",
  databaseURL: "https://clientjobs-21ada-default-rtdb.firebaseio.com", 
  projectId: "clientjobs-21ada",
  storageBucket: "clientjobs-21ada.appspot.com",
  messagingSenderId: "128973874970",
  appId: "1:128973874970:web:5e3a03ff3aae804b6c6ea3"
};


// Initialize Google Firebase
const googleApp = initializeApp(googleConfig);
const googleAuth = getAuth(googleApp);
const google_db = getDatabase(googleApp);

// Initialize Microsoft Firebase
const microsoftApp = initializeApp(microsoftConfig, "microsoftApp");
const microsoftAuth = getAuth(microsoftApp);
const microsoft_db = getDatabase(microsoftApp);

const databaseApp = initializeApp(dbConfig, "databaseApp");
const db = getDatabase(databaseApp);

export {  googleAuth, google_db, microsoftAuth, microsoft_db,db };