import React, { useEffect, useState } from 'react';
import '../stylesheets/FreelancerPayments.css';
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";

import { getDatabase, ref, get, update,onValue } from "firebase/database";
import { applications_db, db } from '../firebaseConfig';

const FreelancerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);


  const handlePaymentStatusChange = async (paymentId, status) => {
  setUpdatingId(paymentId); // show spinner/button disabled
  const parts = paymentId.split('_ms_');
  const milestoneIndex = parts[1];
  const [parentKey, jobKey] = parts[0].split('_');

  const accepted_jobRef = ref(
    applications_db,
    `accepted_applications/${parentKey}/${jobKey}/job_milestones/${milestoneIndex}`
  );


  try {
    await update(accepted_jobRef, { status });
    alert(`Milestone marked as ${status}`);

    const updatedPayments = payments.map(payment =>
      payment.id === paymentId ? { ...payment, status } : payment
    );

    setPayments(updatedPayments);
  } catch (error) {
    console.error("Error updating payment status:", error);
  }

  setUpdatingId(null); // done
};


  useEffect(() => {
    const userUID = localStorage.getItem("userUID");
    const acceptedRef = ref(applications_db, 'accepted_applications');
  
    const unsubscribe = onValue(acceptedRef, (snapshot) => {
      const jobList = [];
  
      snapshot.forEach(parentSnap => {
        parentSnap.forEach(jobSnap => {
          const data = jobSnap.val();
          if (data.applicant_userUID === userUID && Array.isArray(data.job_milestones)) {
            data.job_milestones.forEach((milestone, index) => {
              jobList.push({
                id: parentSnap.key + "_" + jobSnap.key + "_ms_" + index, // include parentSnap.key
                jobTitle: data.jobTitle,
                client: data.clientName || 'Unknown',
                milestone: milestone.description,
                amount: milestone.amount,
                status: milestone.status,
                dueDate: milestone.dueDate || 'N/A'
              });

            });
          }
        });
      });
  
      setPayments(jobList);
    });
  
    return () => unsubscribe(); // clean up on unmount
  }, []);


  const toggleStatus = (id) => {
  const payment = payments.find(p => p.id === id);
  const newStatus = payment.status === 'Pending' ? 'Done' : 'Pending';
  handlePaymentStatusChange(id, newStatus);
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
     <>
          <HeaderClient />
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
                    disabled={updatingId === payment.id}
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
<FooterClient />
    </>
  );
};

export default FreelancerPayments;
