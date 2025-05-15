import React, { useEffect, useState } from 'react';
import '../stylesheets/ClientPayments.css';
import { ref, get, update, onValue, runTransaction } from "firebase/database";
import { applications_db } from '../firebaseConfig';

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [message, setMessage] = useState('');

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
            if (data.applicant_userUID === userUID || data.client_userUID === userUID) {
              data.job_milestones.forEach((milestone, index) => {
                jobList.push({
                  id: jobSnap.key + "_ms_" + index,
                  jobKey: jobSnap.key,
                  milestoneIndex: index,
                  jobTitle: data.jobTitle,
                  client: data.clientName || 'Unknown',
                  freelancerUID: data.applicant_userUID,
                  clientUID: data.client_userUID,
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
      }
    } catch (error) {
      console.error("Error fetching accepted jobs:", error);
    }
  };

  const handlePaymentStatusChange = async (paymentId, newStatus) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const { jobKey, milestoneIndex, amount, freelancerUID, clientUID } = payment;
    const milestoneRef = ref(applications_db, `accepted_applications/${jobKey}/job_milestones/${milestoneIndex}`);
    const clientWalletRef = ref(applications_db, `wallets/${clientUID}`);
    const freelancerWalletRef = ref(applications_db, `wallets/${freelancerUID}`);

    if (newStatus === "Paid") {
      try {
        await runTransaction(clientWalletRef, (currentClientBalance) => {
          if (currentClientBalance == null || currentClientBalance < amount) {
            throw new Error("Insufficient balance in client wallet.");
          }
          return currentClientBalance - amount;
        });

        await runTransaction(freelancerWalletRef, (currentFreelancerBalance) => {
          return (currentFreelancerBalance || 0) + amount;
        });

        await update(milestoneRef, { status: "Paid" });

        const updated = payments.map(p =>
          p.id === paymentId ? { ...p, status: "Paid" } : p
        );
        setPayments(updated);

        const updatedWalletSnap = await get(clientWalletRef);
        if (updatedWalletSnap.exists()) {
          const newWallet = updatedWalletSnap.val();
          setWallet(newWallet);
          localStorage.setItem("clientWallet", newWallet.toString());
        }

        setMessage("Payment successful.");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        console.error("Payment error:", error.message);
        alert(error.message);
      }
    } else {
      try {
        await update(milestoneRef, { status: newStatus });
        const updated = payments.map(p =>
          p.id === paymentId ? { ...p, status: newStatus } : p
        );
        setPayments(updated);
      } catch (error) {
        console.error("Status update error:", error.message);
      }
    }
  };

  const handleDeposit = () => {
    const input = prompt("Enter amount to deposit:");
    const amount = parseFloat(input);

    if (!isNaN(amount) && amount > 0) {
      const userUID = localStorage.getItem("userUID");
      const walletRef = ref(applications_db, `wallets/${userUID}`);

      runTransaction(walletRef, (currentBalance) => {
        return (currentBalance || 0) + amount;
      }).then(({ snapshot }) => {
        const newBalance = snapshot.val();
        setWallet(newBalance);
        localStorage.setItem("clientWallet", newBalance.toString());
        setMessage("Deposit successful");
        setTimeout(() => setMessage(''), 3000);
      }).catch(error => {
        console.error("Deposit failed:", error.message);
      });
    } else {
      alert("Invalid amount entered.");
    }
  };

  useEffect(() => {
    fetchAcceptedJobs();
  }, []);

  useEffect(() => {
    const savedWallet = localStorage.getItem("clientWallet");
    if (savedWallet) setWallet(parseFloat(savedWallet));
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>Payments for Clients</h2>
          <button onClick={handleDeposit} className="deposit-button">Deposit</button>
        </div>

        {message && <p className="success-message">{message}</p>}

        <section className="wallet-section">
          <h3>Client Wallet</h3>
          <p>Balance: ${wallet.toFixed(2)}</p>
        </section>

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
                    {job.status === "Done" ? (
                      <button className="mark-paid-btn" onClick={() => handlePaymentStatusChange(job.id, 'Paid')}>
                        Mark as Paid
                      </button>
                    ) : (
                      <span>—</span>
                    )}
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
