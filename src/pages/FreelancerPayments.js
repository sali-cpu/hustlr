import React, { useState } from 'react';
import '../stylesheets/FreelancerPayments.css';

const FreelancerPayments = () => {
  // Temporary mock payments data
  const [payments, setPayments] = useState([
    {
      id: 1,
      jobTitle: 'Website Redesign',
      client: 'Jane Doe',
      milestone: 'UI Mockups',
      amount: 300,
      status: 'Pending',
      dueDate: '2025-04-20'
    }
  ]);

  // Toggle status (for now just between Pending and Done)
  const toggleStatus = (id) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === id
          ? { ...payment, status: payment.status === 'Pending' ? 'Done' : 'Pending' }
          : payment
      )
    );
  };

  return (
    <main className="client-payments-main">
      <header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Jobs for Clients</h1>
        </section>

        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/Freelancer">Home</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <section className="payments-section">
        <h2>Payments for Freelancers</h2>

        <section className="filters">
          <input type="text" placeholder="Search by freelancer or job title" />
          <select>
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
          <input type="date" />
          <input type="date" />
          <button>Export CSV</button>
        </section>

        <table className="payments-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Client</th>
              <th>Milestone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.jobTitle}</td>
                <td>{payment.client}</td>
                <td>{payment.milestone}</td>
                <td>${payment.amount}</td>
                <td><span className={`status ${payment.status.toLowerCase()}`}>{payment.status}</span></td>
                <td>{payment.dueDate}</td>
                <td>
                  <button
                    className="mark-paid-btn"
                    onClick={() => toggleStatus(payment.id)}
                  >
                    Mark as Done
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default FreelancerPayments;
