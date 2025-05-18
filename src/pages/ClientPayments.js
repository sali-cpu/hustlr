import React, { useEffect, useState } from 'react';
import '../stylesheets/ClientPayments.css';
import { ref, get, update } from "firebase/database";
import { applications_db } from '../firebaseConfig';
import HeaderClient from '../components/HeaderClient';
import FooterClient from '../components/FooterClient';

const ClientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [message, setMessage] = useState('');
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const savedWallet = localStorage.getItem("clientWallet");
    if (savedWallet) setWallet(parseFloat(savedWallet));

    const fetchJobs = async () => {
      const userUID = localStorage.getItem("userUID");
      const acceptedRef = ref(applications_db, 'accepted_applications');

      try {
        const snapshot = await get(acceptedRef);
        const jobList = [];
        const freelancerDone = JSON.parse(localStorage.getItem("freelancerDoneMilestones") || "{}");
        const paidMilestones = JSON.parse(localStorage.getItem("paidMilestones") || "{}");

        if (snapshot.exists()) {
          snapshot.forEach(parentSnap => {
            parentSnap.forEach(jobSnap => {
              const data = jobSnap.val();
              if (data.applicant_userUID === userUID && Array.isArray(data.job_milestones)) {
                data.job_milestones.forEach((milestone, index) => {
                  const id = jobSnap.key + "_ms_" + index;
                  let status = milestone.status || 'Pending';
                  if (freelancerDone[id]) status = 'Done';
                  if (paidMilestones[id]) status = 'Paid';

                  jobList.push({
                    id,
                    jobSnapKey: parentSnap.key + '/' + jobSnap.key,
                    index,
                    jobTitle: data.jobTitle,
                    freelancer: data.name || 'Unknown',
                    milestone: milestone.description,
                    amount: milestone.amount,
                    status: status,
                    dueDate: milestone.duedate || 'N/A'
                  });
                });
              }
            });
          });
          setPayments(jobList);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  const handleDeposit = () => {
    const input = prompt("Enter amount to deposit:");
    const amount = parseFloat(input);
    if (!isNaN(amount) && amount > 0) {
      const newBalance = wallet + amount;
      setWallet(newBalance);
      localStorage.setItem("clientWallet", newBalance.toString());
      setMessage("Deposit successful");
      setTimeout(() => setMessage(''), 3000);
    } else {
      alert("Invalid amount entered.");
    }
  };

  const handlePay = async (payment) => {
    if (wallet < payment.amount) {
      alert("Insufficient funds.");
      return;
    }

    try {
      const newWallet = wallet - parseFloat(payment.amount);
      const freelancerWallet = parseFloat(localStorage.getItem("freelancerWallet") || "0");
      const updatedFreelancerWallet = freelancerWallet + parseFloat(payment.amount);

      // Update milestone status in database
      const milestoneRef = ref(applications_db, `accepted_applications/${payment.jobSnapKey}/job_milestones/${payment.index}`);
      await update(milestoneRef, { status: "Paid" });

      // Update local storage
      const paidMilestones = JSON.parse(localStorage.getItem("paidMilestones") || "{}");
      paidMilestones[payment.id] = true;
      localStorage.setItem("paidMilestones", JSON.stringify(paidMilestones));

      localStorage.setItem("clientWallet", newWallet.toString());
      localStorage.setItem("freelancerWallet", updatedFreelancerWallet.toString());

      setWallet(newWallet);
      setPayments(prev =>
        prev.map(p => p.id === payment.id ? { ...p, status: 'Paid' } : p)
      );
    } catch (err) {
      console.error("Error updating milestone as Paid:", err);
    }
  };

  // Filter payments based on filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         payment.freelancer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    const matchesDateRange = (
      (!startDate || payment.dueDate >= startDate) && 
      (!endDate || payment.dueDate <= endDate)
    );
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Job Title', 'Freelancer', 'Milestone', 'Amount', 'Status', 'Due Date'];
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    filteredPayments.forEach(payment => {
      const values = [
        `"${payment.jobTitle}"`,
        `"${payment.freelancer}"`,
        `"${payment.milestone}"`,
        payment.amount,
        payment.status,
        payment.dueDate,
      ];
      csvRows.push(values.join(','));
    });

    // Create and download CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Client_payments_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
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

          <section className="filters">
            <input 
              type="text" 
              placeholder="Search by freelancer or job title" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Done">Done</option>
            </select>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
            />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
            />
            <button onClick={exportToCSV}>Export CSV</button>
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
              {filteredPayments.length === 0 ? (
                <tr><td colSpan="7">No payments available.</td></tr>
              ) : (
                filteredPayments.map(job => (
                  <tr key={job.id}>
                    <td>{job.jobTitle}</td>
                    <td>{job.freelancer}</td>
                    <td>{job.milestone}</td>
                    <td>${job.amount}</td>
                    <td><span className={`status ${job.status.toLowerCase()}`}>{job.status}</span></td>
                    <td>{job.dueDate}</td>
                    <td>
                      {job.status === 'Done' && (
                        <button className="mark-paid-btn" onClick={() => handlePay(job)}>
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
      <FooterClient />
    </>
  );
};

export default ClientPayments;
