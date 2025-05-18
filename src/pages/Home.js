import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/Landing.css';
import hero1 from '../images/HeroJPG.jpg';
import hero2 from '../images/NewHero.jpg';
import hero3 from '../images/HeroJPG3.jpg';
import hero4 from '../images/NewHero2.jpg';
import job from '../images/jobJPG.jpg';
import task from '../images/taskJp.jpg';
import payment from '../images/payment.jpg';
import google from '../images/google-logo.png';
import netflix from '../images/netflix-logo.jpg';
import pg from '../images/pg-logo.jpg';
import paypal from '../images/paypal-logo.jpg';
import payoneer from '../images/payoneer-logo.jpg';

function Home() {
  const navigate = useNavigate();

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
    <main className="landing">
      <section className="text-overlay">
        <h2>Empowering Freelancers & Clients</h2>
        <p>Seamlessly manage contracts, payments & Projects</p>

        <section className="search-box">
          <input type="text" placeholder="Search for any service..." />
          <button className="search-icon">🔍</button>
        </section>

        <section className="cta-buttons">
          <button className="cta" onClick={() => navigate('/SignIn')}>Find work</button>
          <button className="cta" onClick={() => navigate('/SignIn')}>Hire talent</button>
        </section>

        <section className="trusted-by">
          <strong>Trusted by:</strong>
          {[google, netflix, pg, paypal, payoneer].map((logo, i) => (
            <img key={i} src={logo} alt={`Logo ${i + 1}`} />
          ))}
        </section>
      </section>

      <section className="image-slider">
        <section className="slide-track">
          {[hero1, hero2, hero3, hero4, hero1, hero2, hero3, hero4].map((img, i) => (
            <img key={i} src={img} alt={`Hero ${i + 1}`} />
          ))}
        </section>
      </section>

      <section className="categories">
        <h2>Explore Categories</h2>
        <section className="category-grid">
          <article className="category-card" onClick={() => navigate('/SignIn')} style={{ cursor: 'pointer' }}>
            <img src={job} alt="Job Icon" />
            <p>Post and Apply for Jobs</p>
          </article>

          <article className="category-card" onClick={() => navigate('/SignIn')} style={{ cursor: 'pointer' }}>
            <img src={task} alt="Tasks Icon" />
            <p>Manage Tasks & Milestones</p>
          </article>

          <article className="category-card" onClick={() => navigate('/SignIn')} style={{ cursor: 'pointer' }}>
            <img src={payment} alt="Payment Icon" />
            <p>Secure Milestone-Based Payment</p>
          </article>
        </section>
      </section>
    </main>
  );
}

export default Home;
