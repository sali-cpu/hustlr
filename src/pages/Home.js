
import React, { useEffect } from 'react';
import '../stylesheets/Landing.css';
import Header from '../components/Header';
import Footer from '../components/Footer';


import hero1 from '../images/HeroJPG.jpg';
import hero2 from '../images/HeroJPG2.jpg';
import hero3 from '../images/HeroJPG3.jpg';
import hero4 from '../images/HeroJPG4.jpg';
import job from '../images/jobJPG.jpg';
import task from '../images/taskJp.jpg';
import payment from '../images/payment.jpg';
import google from '../images/google-logo.png';
import netflix from '../images/netflix-logo.jpg';
import pg from '../images/pg-logo.jpg';
import paypal from '../images/paypal-logo.jpg';
import payoneer from '../images/payoneer-logo.jpg';

function Home() {
  useEffect(() => {
    const toggle = document.getElementById('dashboard-toggle');
    const sidebar = document.getElementById('sidebar');

    if (toggle && sidebar) {
      toggle.onclick = () => {
        sidebar.classList.toggle('show');
      };
    }
  }, []);

  return (
    
      
      <div className="landing">
        
        <div className="image-slider">
          <div className="slide-track">
            {[hero1, hero2, hero3, hero4, hero1, hero2, hero3, hero4].map((img, i) => (
              <img key={i} src={img} alt={`Hero ${i + 1}`} />
            ))}
          </div>

          <div className="text-overlay">
            <h2>Empowering Freelancers & Clients</h2>
            <p>Seamlessly manage contracts, payments & Projects</p>

            <div className="search-box">
              <input type="text" placeholder="Search for any service..." />
              <button className="search-icon">🔍</button>
            </div>

            <div className="cta-buttons">
              <button className="cta">Find work</button>
              <button className="cta">Hire talent</button>
            </div>

            <div className="trusted-by">
              <span>Trusted by:</span>
              {[google, netflix, pg, paypal, payoneer].map((logo, i) => (
                <img key={i} src={logo} alt={`Logo ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>

        <section className="categories">
          <h2>Explore Categories</h2>
          <div className="category-grid">
            <div className="category-card">
              <img src={job} alt="Job Icon" />
              <p>Post and Apply for Jobs</p>
            </div>
            <div className="category-card">
              <img src={task} alt="Tasks Icon" />
              <p>Manage Tasks & Milestones</p>
            </div>
            <div className="category-card">
              <img src={payment} alt="Payment Icon" />
              <p>Secure Milestone-Based Payment</p>
            </div>
          </div>
        </section>
      </div>
      
  );
}

export default Home;
