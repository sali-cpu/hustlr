import React from "react";
import jobJPG from '../images/jobJPG.jpg';
import taskJp from '../images/taskJp.jpg';
import payment from '../images/payment.jpg';

class Land extends React.Component {
  render() {
    return (
      <section className="categories">
        <h2>Explore Categories</h2>
        <section className="category-grid">
          <article className="category-card">
            <img src={jobJPG} alt="Job Icon" />
            <p>Post and Apply for Jobs</p>
          </article>
          <article className="category-card">
            <img src={taskJp} alt="Tasks Icon" />
            <p>Manage Tasks & Milestones</p>
          </article>
          <article className="category-card">
            <img src={payment} alt="Payment Icon" />
            <p>Secure Milestone-Based Payment</p>
          </article>
        </section>
      </section>
    );
  }
}

export default Land;
