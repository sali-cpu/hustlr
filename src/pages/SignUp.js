import React from "react";
import '../stylesheets/signup_style.css';
//import logo from '../images/logo.png';
import google_icon from '../images/google_icon.png';
import micro_icon from '../images/micro_icon.png';
// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
// Use only one Firebase for google
const firebaseConfig = {
  apiKey: "AIzaSyDPrCgc4hTSO8am7LFi6KasGo7vCISXV9U",
  authDomain: "authenticate-13e26.firebaseapp.com",
  projectId: "authenticate-13e26",
  storageBucket: "authenticate-13e26.appspot.com",
  messagingSenderId: "839678165187",
  appId: "1:839678165187:web:962a4613e2ad62c81ea276",
};

//Config for microsoft
const firebaseConfig1 = {
  apiKey: "AIzaSyD27cvVjz9oBqf6aysk4Tn8uBzZLxSJFU4",
  authDomain: "freelancer-771b9.firebaseapp.com",
  projectId: "freelancer-771b9",
  storageBucket: "freelancer-771b9.appspot.com",
  messagingSenderId: "246641148741",
  appId: "1:246641148741:web:bfe70c74d8b6b684af742c",
  measurementId: "G-0S2XLNZX08"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Microsoft Firebase (named app)
const app1 = initializeApp(firebaseConfig1, "microsoftApp");
const auth1 = getAuth(app1);
// Google provider


const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Microsoft provider
const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({
  prompt: "select_account",
});

const SignUp = () => {
  const navigate = useNavigate();
  const handleGoogleSignInClick = () => {
    const role = document.querySelector('input[name="role"]:checked')?.value;

    if (!role) {
      alert("Please select a role before logging in.");
      return;
    }

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const user = result.user;
        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userName", user.displayName);
        goToPage(role);
      })
      .catch(() => {
        alert("404 error signing in!");
      });
  };

  const handleMicrosoftSignIn = async () => 
    {
    const role = document.querySelector('input[name="role"]:checked')?.value;

    if (!role) {
      alert("Please select a role before signing in.");
      return;
    }

    try {
      const result = await signInWithPopup(auth1, microsoftProvider);
      const user = result.user;

      localStorage.setItem("userUID", user.uid);
      localStorage.setItem("userName", user.displayName);

      goToPage(role);
    } 
    catch (error) 
    {
      console.error("Microsoft sign-in error:", error);
      alert("Sign-in failed. Please try again.");
    }
  };

  const goToPage = (role) => {
    switch (role.toLowerCase()) {
      case "client":
        navigate("/client");
        break;
      case "freelancer":
        navigate("/freelancer");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        alert("Unknown role selected.");
    };
  }

  return (
    <>
      <section className="hero_sect">
      <h1 className="hustlr-header">Hustlr.</h1>

        
      </section>

      <main className="signup-container">
        <article className="signup-card">
          <header className="signup-header">
            <h1>Sign up to Hustlr</h1>
            <p>Pick a role</p>
          </header>

          <section className="signup-form">
            <label className="form-control" htmlFor="Admin">
              <input type="radio" id="Admin" name="role" value="Admin" />
              Admin
            </label>
            <label className="form-control" htmlFor="Client">
              <input type="radio" id="Client" name="role" value="Client" />
              Client
            </label>
            <label className="form-control" htmlFor="Freelancer">
              <input
                type="radio"
                id="Freelancer"
                name="role"
                value="Freelancer"
              />
              Freelancer
            </label>
          </section>

          <section className="signup-form">
            <button
              id="googlebtn"
              type="button"
              className="googlebtn"
              onClick={handleGoogleSignInClick}
            >
              <img src = {google_icon} alt="g_logo" />
              Sign in with Google
            </button>
          </section>

          <section className="ms_sign msbutton_sect">
            <button
              id="ms-signin-btn"
              className="msbutton"
              onClick={handleMicrosoftSignIn}
            >
              <img src = {micro_icon} alt="micro_logo" />
              Sign in with Microsoft
            </button>
          </section>

          <footer className="signup-footer">
            <p>
              By clicking continue, you agree to our{" "}
              <a href="terms.html" rel="noopener noreferrer">
                Terms of Service
              </a>
            </p>
          </footer>
        </article>
      </main>
    </>
  );
};

export default SignUp;
