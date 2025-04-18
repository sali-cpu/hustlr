import React from "react";
import '../stylesheets/style.css';
import cuteWelcome from '../images/cute.jpg';
import hero1 from '../images/HeroJPG.jpg';
import { Link } from "react-router-dom";
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";

class Client extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showWelcomeBox: true,
    };
  }

  closeMessage = () => {
    this.setState({ showWelcomeBox: false });
  };

  render() {
    return (
      <>
        <HeaderClient />


        <div className="search-box">
              <input type="text" placeholder="Search for any service..." />
              <button className="search-icon">🔍</button>
            </div>


        <main className>
          {this.state.showWelcomeBox && (
            <section className="messagebox" id="welcomeBox">
              <button className="close" onClick={this.closeMessage}>×</button>
              <img src={cuteWelcome} alt="Cute Welcome" />
              <h2>Welcome, Client!</h2>
              <p>We’re excited to have you here! Our platform connects you with skilled freelancers ready to bring your projects to life. Explore, collaborate, and create something amazing today.</p>
            </section>
          )}
        </main>

        {!this.state.showWelcomeBox && (
          <section className="categories">
            <div className="category-grid">
            <Link to= "/ClientJobs">
              <div className="category-card">
                <img src={hero1} alt="Jobs" />
                <p>Jobs</p>
              </div>
              </Link>
              <div className="category-card">
                <img src={hero1} alt="Contracts & Tasks" />
                <p>Contracts & Tasks</p>
              </div>
              <div className="category-card">
                <img src={hero1} alt="Payments" />
                <p>Payments</p>
              </div>
              <div className="category-card">
                <img src={hero1} alt="Reports" />
                <p>Reports</p>
              </div>
              <div className="category-card">
                <img src={hero1} alt="Quick Stats" />
                <p>Quick Stats</p>
              </div>
            </div>
          </section>
        )}

        <FooterClient />
      </>
    );
  }
}

export default Client;
