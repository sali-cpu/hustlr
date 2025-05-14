import React from "react";
import '../stylesheets/style.css'; // if you have styles for this page
import { Link } from "react-router-dom";
import cuteWelcome from '../images/cute.jpg';
import HeaderAdmin from "../components/HeaderAdmin";
import job from '../images/Job.png';
import stat from '../images/Quick Stats.png';
import con from '../images/contract.png';
import rep from '../images/Reports.png';
class AdminCorrect extends React.Component {
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
    <HeaderAdmin />

    <main>
      {this.state.showWelcomeBox && (
        <section className="messagebox" id="welcomeBox">
          <button className="close" onClick={this.closeMessage}>×</button>
          <img src={cuteWelcome} alt="Cute Welcome" />
          <h2>Welcome, Admin!</h2>
          <p>
            You have full access to all dashboards and user management tools.
          </p>
        </section>
      )}
    </main>

    {!this.state.showWelcomeBox && (
      <section className="categories">
        <section className="category-grid">
          <Link to="/AdminJobs">
            <section className="category-card">
              <img src={job} alt="Jobs" />
              <p>View all Jobs</p>
            </section>
          </Link>

          <section className="category-card">
            <img src={con} alt="Contracts & Tasks" />
            <p>View all Contracts & Tasks</p>
          </section>

          <section className="category-card">
            <img src={rep} alt="Reports" />
            <p>Admin Reports</p>
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

export default AdminCorrect;
