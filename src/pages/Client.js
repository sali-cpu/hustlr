import React from "react";
import { Link } from "react-router-dom";
import cuteWelcome from '../images/cute.jpg';
import job from '../images/Job.png';
import pay from '../images/Payment.png';
import stat from '../images/Quick Stats.png';
import con from '../images/contract.png';
import rep from '../images/Reports.png';
import hero1 from '../images/HeroJPG.jpg';
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";
import '../stylesheets/Final.css';

class Client extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showWelcomeBox: true,
    };
  }

  closeWelcomeMessage = () => {
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

        <main className="client-main">
          {this.state.showWelcomeBox ? (
            <section className="messagebox">
              <button className="close" onClick={this.closeWelcomeMessage}>×</button>
              <img src={cuteWelcome} alt="Cute Welcome" />
              <h2>Welcome, Client!</h2>
              <p>We’re excited to have you here! Our platform connects you with skilled freelancers ready to bring your projects to life. Explore, collaborate, and create something amazing today.</p>
            </section>
          ) : (
            <section className="categories">
              <div className="category-grid">
                <Link to="/ClientJobs">
                  <div className="category-card">
                    <img src={job} alt="Jobs" />
                    <p>Jobs</p>
                  </div>
                </Link>
                <div className="category-card">
                  <img src={con} alt="Contracts & Tasks" />
                  <p>Contracts & Tasks</p>
                </div>
                <div className="category-card">
                  <img src={pay} alt="Payments" />
                  <p>Payments</p>
                </div>
                <div className="category-card">
                  <img src={rep} alt="Reports" />
                  <p>Reports</p>
                </div>
                <div className="category-card">
                  <img src={stat} alt="Quick Stats" />
                  <p>Quick Stats</p>
                </div>
              </div>
            </section>
          )}
        </main>

       
      </>
    );
  }
}

export default Client;
