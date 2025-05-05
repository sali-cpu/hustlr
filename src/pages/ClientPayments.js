import React, { useEffect, useState } from 'react';
import '../stylesheets/ClientPayments.css';
import { ref, get, update,onValue } from "firebase/database";
import { applications_db } from '../firebaseConfig';

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState(0);

  const fetchAcceptedJobs = async () => {
    const userUID = localStorage.getItem("userUID");
    const acceptedRef = ref(applications_db, 'accepted_applications');

    try {
      const snapshot = await get(acceptedRef);
      const jobList = [];

      if (snapshot.exists()) {
        snapshot.forEach(parentSnap => {
          parentSnap.forEach(jobSnap => {
            const data = jobSnap.val();
            if (data.applicant_userUID === userUID && Array.isArray(data.job_milestones)) {
              data.job_milestones.forEach((milestone, index) => {
                jobList.push({
                  id: jobSnap.key + "_ms_" + index,
                  jobTitle: data.jobTitle,
                  client: data.clientName || 'Unknown',
                  milestone: milestone.description,
                  amount: milestone.amount,
                  status: milestone.status || 'Pending',
                  dueDate: milestone.dueDate || 'N/A'
                });
              });
            }
          });
        });

        setPayments(jobList);
      } else {
        console.log("No accepted jobs found.");
      }
    } catch (error) {
      console.error("Error fetching accepted jobs:", error);
    }
  };

  const handlePaymentStatusChange = async (paymentId, status) => {
    const [jobKey, milestoneIndex] = paymentId.split('_ms_');
    const jobRef = ref(applications_db, `accepted_applications/${jobKey}/job_milestones/${milestoneIndex}`);
    
    try {
      await update(jobRef, { status: status });

      const updatedPayments = payments.map(payment => 
        payment.id === paymentId ? { ...payment, status: status } : payment
      );

      setPayments(updatedPayments);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  useEffect(() => {
    fetchAcceptedJobs();
  }, []);
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
                id: jobSnap.key + "_ms_" + index,
                jobTitle: data.jobTitle,
                client: data.clientName || 'Unknown',
                milestone: milestone.description,
                amount: milestone.amount,
                status: milestone.status || 'Pending',
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

        {/* Client Wallet */}
        <section className="wallet-section">
          <h3>Client Wallet</h3>
          <p>Balance: ${wallet}</p>
        </section>

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
            {payments.length === 0 ? (
              <tr>
                <td colSpan="7">No payments available.</td>
              </tr>
            ) : (
              payments.map((job) => (
                <tr key={job.id}>
                  <td>{job.jobTitle}</td>
                  <td>{job.client}</td>
                  <td>{job.milestone}</td>
                  <td>${job.amount}</td>
                  <td>
                    <span className={`status ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{job.dueDate}</td>
                  <td>
                    <button className="mark-paid-btn" onClick={() => handlePaymentStatusChange(job.id, 'Done')}>
                      Mark as Paid
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default ClientPayments;
