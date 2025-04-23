import React from "react";
import '../stylesheets/signin_style.css';
import google_icon from '../images/google_icon.png';
import micro_icon from '../images/micro_icon.png';
import { googleAuth, google_db, microsoftAuth, microsoft_db } from "../firebaseConfig";
import { ref, get } from "firebase/database";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({ prompt: "select_account" });

const SignIn = () => {
  const navigate = useNavigate();

  const goToPage = (role) => {
    switch (role.toLowerCase()) {
      case "client":
        navigate("/Client");
        break;
      case "freelancer":
        navigate("/Freelancer");
        break;
      case "admin":
        navigate("/Admin");
        break;
      default:
        alert("Role not found for this user.");
    }
  };

  const signInUser = async (auth, provider, db) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = ref(db, 'users/' + user.uid);

      // Store basic info locally
      localStorage.setItem("userUID", user.uid);
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userEmail", user.email);

      // Check if user exists in DB
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const role = snapshot.val().role;
        goToPage(role);
      } else {
        alert("User not found. Redirecting to Sign Up.");
        navigate("/SignUp");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Sign-in failed. Try again.");
    }
  };

  const handleGoogleSignInClick = () => {
    signInUser(googleAuth, googleProvider, google_db);
  };

  const handleMicrosoftSignIn = () => {
    signInUser(microsoftAuth, microsoftProvider, microsoft_db);
  };

  return (
    <>
      <section className="hero_sect">
        <h1 className="hustlr-header">Hustlr.</h1>
      </section>

      <main className="signup-container">
        <article className="signup-card">
          <header className="signup-header">
            <h1>Sign in to Hustlr</h1>
          </header>

          <section className="signup-form">
            <button className="googlebtn" onClick={handleGoogleSignInClick}>
              <img src={google_icon} alt="Google" />
              Sign in with Google
            </button>
          </section>

          <section className="ms_sign msbutton_sect">
            <button className="msbutton" onClick={handleMicrosoftSignIn}>
              <img src={micro_icon} alt="Microsoft" />
              Sign in with Microsoft
            </button>
          </section>

          <footer className="signup-footer">
            <p>
              By clicking continue, you agree to our{" "}
              <a href="terms.html" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
            </p>
          </footer>
        </article>
      </main>
    </>
  );
};

export default SignIn;
