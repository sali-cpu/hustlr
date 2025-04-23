import React from "react";
import '../stylesheets/signup_style.css';
//import logo from '../images/logo.png';
import google_icon from '../images/google_icon.png';
import micro_icon from '../images/micro_icon.png';
// Import Firebase modules
import { googleAuth, google_db, microsoftAuth, microsoft_db} from "../firebaseConfig";
import { get,ref, set, child} from "firebase/database";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
// Use only one Firebase for google


const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Microsoft provider
const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({
  prompt: "select_account",
});

const adminEmails = [

  "2680440@students.wits.ac.za",
  "1602758@students.wits.ac.za",
  
];
const SignUp = () => {
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
        alert("Unknown role selected.");
    }
  };

  const handleGoogleSignInClick = () => {
    signInWithPopup(googleAuth, googleProvider)
      .then((result) => {
        const user = result.user;
        const userRef = ref(google_db, 'users/' + user.uid);
  
        localStorage.setItem("userUID", user.uid);
        localStorage.setItem("userName", user.displayName);
        localStorage.setItem("userEmail", user.email);
  
        // Check if user already exists
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            alert("User already exists. Redirecting you to Sign In...");
            navigate("/SignIn"); // Adjust this route to match your sign-in page
            return;
          }
  
          if (adminEmails.includes(user.email)) {
            goToPage("admin");
          } else {
            const role = document.querySelector('input[name="role"]:checked')?.value;
            if (!role) {
              alert("Please select a role before signing up.");
              return;
            }
  
            // Save new user only if they don't already exist
            set(userRef, {
              role: role
            });
  
            goToPage(role);
          }
        });
      })
      .catch((error) => {
        console.error("Google sign-in error:", error);
        alert("404 error signing in!");
      });
  };
  

  const handleMicrosoftSignIn = async () => {
    try {
      const result = await signInWithPopup(microsoftAuth, microsoftProvider);
      const user = result.user;
      const userRef = ref(microsoft_db, 'users/' + user.uid);
  
      localStorage.setItem("userUID", user.uid);
      localStorage.setItem("userName", user.displayName);
      localStorage.setItem("userEmail", user.email);
  
      // Check if user already exists
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        alert("User already exists. Redirecting you to Sign In...");
        navigate("/SignIn"); // Adjust this route to match your sign-in page
        return;
      }
  
      if (adminEmails.includes(user.email)) {
        goToPage("admin");
      } else {
        const role = document.querySelector('input[name="role"]:checked')?.value;
        if (!role) {
          alert("Please select a role before signing up.");
          return;
        }
  
        // Save new user only if they don't already exist
        await set(userRef, {
          role: role
        });
  
        goToPage(role);
      }
  
    } catch (error) {
      console.error("Microsoft sign-in error:", error);
      alert("Sign-in failed. Please try again.");
    }
  };
  

  return (
    <>
      <section className="hero_sect">
      <h1 className="hustlr-header">Hustlr.</h1>

        
      </section>

      <main className="signup-container">
        <article className="signup-card">
        <header className="signup-header">
            <h1>Sign up to Hustlr</h1>
            
          </header>
          <p>Pick a role</p>
          
          <section className="signup-form">
            {/*<label className="form-control" htmlFor="Admin">
              <input type="radio" id="Admin" name="role" value="Admin" />
              Admin
            </label>*/}
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
