import React from 'react';
import '../stylesheets/ClientPayments.css';

const ClientPayments = () => {
  return (
    <main className="client-payments-main">
      <header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Jobs for Clients</h1>
        </section>

        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/client">Home</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <section className="payments-section">
        <h2>Payments for Clients</h2>

        {/* Filters */}
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

        {/* Payments Table */}
        <table className="payments-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Freelancer</th>
              <th>Milestone</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td>Website Redesign</td>
              <td>Jane Doe</td>
              <td>UI Mockups</td>
              <td>$300</td>
              <td><span className="status pending">Pending</span></td>
              <td>2025-04-20</td>
              <td><button className="mark-paid-btn">Mark as Paid</button></td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default ClientPayments;
