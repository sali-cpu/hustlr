import React from "react";
import jobJPG from '../images/jobJPG.jpg';
import taskJp from '../images/taskJp.jpg';
import payment from '../images/payment.jpg';

class Land extends React.Component {
  render() {
    return (
      <section className="categories">
        <h2>Explore Categories</h2>
        <div className="category-grid">
          <div className="category-card">
            <img src={jobJPG} alt="Job Icon" />
            <p>Post and Apply for Jobs</p>
          </div>
          <div className="category-card">
            <img src={taskJp} alt="Tasks Icon" />
            <p>Manage Tasks & Milestones</p>
          </div>
          <div className="category-card">
            <img src={payment} alt="Payment Icon" />
            <p>Secure Milestone-Based Payment</p>
          </div>
        </div>
      </section>
    );
  }
}

export default Land;
