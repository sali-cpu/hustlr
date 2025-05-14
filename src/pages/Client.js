import React from "react";
import { Link } from "react-router-dom";
import cuteWelcome from '../images/cute.jpg';
import job from '../images/Job.png';
import pay from '../images/Payment.png';
import stat from '../images/Quick Stats.png';
import con from '../images/contract.png';
import rep from '../images/Reports.png';
import HeaderClient from "../components/HeaderClient";
import '../stylesheets/Final.css';

class Client extends React.Component {
 constructor(props) {
    super(props);
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
  
    this.state = {
      showWelcomeBox: !hasSeenWelcome, // Only show if not seen before
    };
  }
  
  closeWelcomeMessage = () => {
    localStorage.setItem('hasSeenWelcome', 'true'); // Remember the user saw it
    this.setState({ showWelcomeBox: false });
  };                                             

  render() {
    return (
      <>
        <HeaderClient />

        <section className="search-box">
          <input type="text" placeholder="Search for any service..." />
          <button className="search-icon">🔍</button>
        </section>

        <main className="client-main">
          {(() => {
            if (this.state.showWelcomeBox) 
              {
              return (
                <section className="messagebox">
                  <button className="close" onClick={this.closeWelcomeMessage}>×</button>
                  <img src={cuteWelcome} alt="Cute Welcome" />
                  <h2>Welcome, Client!</h2>
                  <p>
                    We’re excited to have you here! Our platform connects you with skilled freelancers
                    ready to bring your projects to life. Explore, collaborate, and create something amazing today.
                  </p>
                </section>
              );
            } 
            else 
            {
              return (
                <section className="categories">
                  <section className="category-grid">
                    <Link to="/ClientJobs">
                      <section className="category-card">
                        <img src={job} alt="Jobs" />
                        <p>Jobs</p>
                      </section>
                    </Link>

                    <section className="category-card">
                      <img src={con} alt="Contracts & Tasks" />
                      <p>Contracts & Tasks</p>
                    </section>

                    <Link to="/ClientPayments">
                      <section className="category-card">
                        <img src={pay} alt="Payments" />
                        <p>Payments</p>
                      </section>
                    </Link>

                    <section className="category-card">
                      <img src={rep} alt="Reports" />
                      <p>Reports</p>
                    </section>

                    <Link to="/CQStats">
                    <section className="category-card">
                      <img src={stat} alt="Quick Stats" />
                      <p>Quick Stats</p>
                    </section>
                    </Link>
                    
                  </section>
                </section>
              );
            }
          })
          ()
          }
        </main>
      </>
    );
  }
}

export default Client;
