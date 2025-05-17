import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import "../stylesheets/ConClients.css";
import HeaderFreelancer from '../components/HeaderFreelancer';
import FooterClient from '../components/FooterClient';

const ConTasksFreelancer = () => {
  const userUID = localStorage.getItem('userUID');
  const userRole = localStorage.getItem('userRole'); // 'client' or 'freelancer'

  const [activeJobs, setActiveJobs] = useState([]);
  const [previousJobs, setPreviousJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    const contractsRef = ref(db, 'contracts');
    onValue(contractsRef, snapshot => {
      const data = snapshot.val();
      const current = [], previous = [];

      for (const id in data) {
        const job = { id, ...data[id] };
        const isUserJob = userRole === 'client' ? job.clientUID === userUID : job.freelancerUID === userUID;

        if (isUserJob) {
          if (job.status === 'active') current.push(job);
          else previous.push(job);
        }
      }

      setActiveJobs(current);
      setPreviousJobs(previous);
    });
  }, [userUID, userRole]);

  const toggleExpand = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  

  const renderJobDetails = (job) => (
    <div className="job-details">
      <p><strong>Description:</strong> {job.description}</p>
      <p><strong>Budget:</strong> R{job.budget}</p>
      <p><strong>Deadline:</strong> {job.deadline}</p>
      <p><strong>{userRole === 'freelancer' ? 'Client' : 'Freelancer'}:</strong> {job.partnerName}</p>
      <h4>Milestones:</h4>
      <ul>
        {job.milestones?.map((m, i) => (
          <li key={i}>{m.description} - R{m.amount} - {m.status}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <HeaderFreelancer />
<header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Contracts and tasks</h1>
        </section>
        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/freelancer">Home</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <main className="manage-contracts-container">
        <section className="contracts-section">
          <h2>Current Jobs</h2>
          {activeJobs.length === 0 && <p>No active jobs found.</p>}
          {activeJobs.map(job => (
            <div key={job.id} className="job-card">
              <button onClick={() => toggleExpand(job.id)}>
                {job.title}
              </button>
              {expandedJobId === job.id && renderJobDetails(job)}
            </div>
          ))}
        </section>

        <section className="contracts-section">
          <h2>Previous Jobs</h2>
          {previousJobs.length === 0 && <p>No previous jobs found.</p>}
          {previousJobs.map(job => (
            <div key={job.id} className="job-card">
              <button onClick={() => toggleExpand(job.id)}>
                {job.title}
              </button>
              {expandedJobId === job.id && renderJobDetails(job)}
            </div>
          ))}
        </section>
      </main>
      <FooterClient />
    </>
  );
};

export default ConTasksFreelancer;
