import React, { useEffect, useState } from 'react';
import '../stylesheets/FreelancerPayments.css';
import { ref, get, update } from "firebase/database";
import { applications_db } from '../firebaseConfig';
import HeaderClient from '../components/HeaderClient';
import FooterClient from '../components/FooterClient';

const FreelancerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [wallet, setWallet] = useState(0);
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const savedWallet = localStorage.getItem("freelancerWallet");
    if (savedWallet) setWallet(parseFloat(savedWallet));

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
                  const id = jobSnap.key + "ms" + index;
                  jobList.push({
                    id,
                    jobTitle: data.jobTitle,
                    milestone: milestone.description,
                    amount: milestone.amount,
                    status: milestone.status || 'Pending',
                    dueDate: milestone.duedate || 'N/A',
                    parentKey: parentSnap.key,
                    jobKey: jobSnap.key,
                    milestoneIndex: index
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

    fetchAcceptedJobs();
  }, []);

  const handleMarkDone = async (payment) => {
    try {
      const jobRef = ref(applications_db, `accepted_applications/${payment.parentKey}/${payment.jobKey}/job_milestones/${payment.milestoneIndex}`);
      await update(jobRef, { status: "Done" });

      // Update UI state
      setPayments(prev =>
        prev.map(p => p.id === payment.id ? { ...p, status: "Done" } : p)
      );
    } catch (err) {
      console.error("Failed to update milestone status:", err);
      alert("Failed to mark milestone as done.");
    }
  };

  const handleMarkInProgress = async (payment) => {
    try {
      const jobRef = ref(applications_db, `accepted_applications/${payment.parentKey}/${payment.jobKey}/job_milestones/${payment.milestoneIndex}`);
      await update(jobRef, { status: "In-Progress" });

      // Update UI state
      setPayments(prev =>
        prev.map(p => p.id === payment.id ? { ...p, status: "In-Progress" } : p)
      );
    } catch (err) {
      console.error("Failed to update milestone status:", err);
      alert("Failed to mark milestone as in-progress.");
    }
  };

  // Toggle payment status
  const togglePaymentStatus = (id) => {
    setPayments(payments.map(payment => 
      payment.id === id 
        ? { ...payment, status: payment.status === 'Pending' ? 'Paid' : 'Pending' } 
        : payment
    ));
  };

  // Filter payments based on filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         payment.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    const matchesDateRange = (
      (!startDate || payment.dueDate >= startDate) && 
      (!endDate || payment.dueDate <= endDate)
    );
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Job Title', 'Milestone', 'Amount', 'Status', 'Due Date'];
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    filteredPayments.forEach(payment => {
      const values = [
        `"${payment.jobTitle}"`,
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
    link.setAttribute('download', `Freelancer_payments_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <HeaderClient/>
      <main className="client-payments-main">
        <header className="client-jobs-header">
          <section className="header-title-area">
            <h1 className="main-title">Jobs for Freelancer</h1>
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

          <section className="wallet-section">
            <h3>Freelancer Wallet</h3>
            <p>Balance: ${wallet.toFixed(2)}</p>
          </section>

          <section className="filters">
            <input 
              type="text" 
              placeholder="Search by freelancer or job title" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <button onClick={exportToCSV}>Export CSV</button>
          </section>

          <table className="payments-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Milestone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.jobTitle}</td>
                  <td>{payment.milestone}</td>
                  <td>${payment.amount}</td>
                  <td><span className={`status ${payment.status.toLowerCase()}`}>{payment.status}</span></td>
                  <td>{payment.dueDate}</td>
                  <td>
                    {["pending", "In-Progress"].includes(payment.status) ? (
                      <>
                        {payment.status !== "In-Progress" && (
                          <button
                            className="mark-in-progress-btn"
                            onClick={() => handleMarkInProgress(payment)}
                          >
                            Mark as In-Progress
                          </button>
                        )}
                        <button
                          className="mark-done-btn"
                          onClick={() => handleMarkDone(payment)}
                        >
                          Mark as Done
                        </button>
                      </>
                    ) : (
                      <span>{payment.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      <FooterClient/>
    </>
  );
};

export default FreelancerPayments;
