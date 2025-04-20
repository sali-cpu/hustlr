import React from "react";
import '../stylesheets/style.css'; // if you have styles for this page
import { Link } from "react-router-dom";
import logo from '../images/logo.png';
import cuteWelcome from '../images/cute.jpg';
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";
import hero1 from '../images/HeroJPG.jpg';

class Freelancers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      showWelcomeBox: true
    };
  }

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

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


        <main>
          {this.state.showWelcomeBox && (
            <section className="messagebox" id="welcomeBox">
              <button className="close" onClick={this.closeMessage}>×</button>
              <img src={cuteWelcome} alt="Cute Welcome" />
              <h2>Welcome, Freelancer!</h2>
              <p>
              Access gigs, manage your profile, and collaborate with clients
              </p>
            </section>
          )}
        </main>

        {!this.state.showWelcomeBox && (
          <section className="categories">
            <div className="category-grid">
            <Link to = "/FreelancerJobs">
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
       

      </>
    );
  }
}

export default Freelancers;
