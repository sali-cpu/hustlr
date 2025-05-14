import React from "react";
import '../stylesheets/style.css'; // if you have styles for this page
import { Link } from "react-router-dom";
import cuteWelcome from '../images/cute.jpg';
import job from '../images/Job.png';
import pay from '../images/Payment.png';
import stat from '../images/Quick Stats.png';
import con from '../images/contract.png';
import rep from '../images/Reports.png';
import HeaderFreelancer from '../components/HeaderFreelancer';

class Freelancers extends React.Component {
    constructor(props) {
    super(props);
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
  
    this.state = {
      showWelcomeBox: !hasSeenWelcome, 
    };
  }
  
  closeWelcomeMessage = () => {
    localStorage.setItem('hasSeenWelcome', 'true'); 
    this.setState({ showWelcomeBox: false });
  };

  render() {
    return (
      <>
        <HeaderFreelancer />
         <section className="search-box">
              <input type="text" placeholder="Search for any service..." />
              <button className="search-icon">🔍</button>
            </section>


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
            <section className="category-grid">
            <Link to = "/FreelancerJobs">
              <section className="category-card">
                <img src={job} alt="Jobs" />
                <p>Jobs</p>
              </section>
              </Link>
              <section className="category-card">
                <img src={con} alt="Contracts & Tasks" />
                <p>Contracts & Tasks</p>
              </section>
              <Link to = "/FreelancerPayments">
              <section className="category-card">
                <img src={pay} alt="Payments" />
                <p>Payments</p>
              </section>
              </Link>
              <section className="category-card">
                <img src={rep} alt="Reports" />
                <p>Reports</p>
              </section>
              <section className="category-card">
                <img src={stat} alt="Quick Stats" />
                <p>Quick Stats</p>
              </section>
            </section>
          </section>
        )}
       
      </>
    );
  }
}

export default Freelancers;
