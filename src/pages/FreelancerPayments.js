import React, { useState } from 'react';
import '../stylesheets/FreelancerPayments.css';

const FreelancerPayments = () => {
  const [payments, setPayments] = useState([
    {
      id: 1,
      jobTitle: 'Website Redesign',
      client: 'Jane Doe',
      milestone: 'UI Mockups',
      amount: 300,
      status: 'Pending',
      dueDate: '2025-04-20'
    },
    // Add more sample data for testing
    {
      id: 2,
      jobTitle: 'Mobile App Development',
      client: 'John Smith',
      milestone: 'Initial Prototype',
      amount: 500,
      status: 'Done',
      dueDate: '2025-03-15'
    }
  ]);

  const toggleStatus = (id) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === id
          ? { ...payment, status: payment.status === 'Pending' ? 'Done' : 'Pending' }
          : payment
      )
    );
  };

  const exportToCSV = () => {
    // Prepare CSV content
    const headers = ['Job Title', 'Client', 'Milestone', 'Amount', 'Status', 'Due Date'];
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    payments.forEach(payment => {
      const values = [
        `"${payment.jobTitle}"`,
        `"${payment.client}"`,
        `"${payment.milestone}"`,
        payment.amount,
        payment.status,
        payment.dueDate
      ];
      csvRows.push(values.join(','));
    });

    // Create CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set download attributes
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <button onClick={exportToCSV}>Export CSV</button>
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
                    {payment.status === 'Pending' ? 'Mark as Done' : 'Mark as Pending'}
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
