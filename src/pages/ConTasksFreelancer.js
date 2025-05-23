import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import "../stylesheets/ConFree.css";
import HeaderFreelancer from '../components/HeaderFreelancer';
import FooterClient from '../components/FooterClient';
import { applications_db } from '../firebaseConfig';

const ConTasksFreelancer = () => {
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [previousJobs, setPreviousJobs] = useState([]);



useEffect(() => {
  const unsub = onValue(ref(applications_db, 'accepted_applications'), snapshot => {
    if (!snapshot.exists()) return;

    const applications = snapshot.val();
    const currentUID = localStorage.getItem("userUID");

    const active = [];
    const previous = [];

    Object.values(applications).forEach(jobGroup => {
      Object.entries(jobGroup).forEach(([appId, appData]) => {
        if (appData.applicant_userUID !== currentUID) return;

        const milestones = appData.job_milestones || {};
        const milestoneList = Object.values(milestones);

        const hasActiveMilestone = milestoneList.some(m => {
          const status = m.status?.toLowerCase();
          return status === "pending" || status === "in-progress";
        });

        const job = {
          title: appData.jobTitle,
          description: appData.motivation,
          partnerName: `${appData.name} ${appData.surname}`,
          deadline: appData.deadline || "N/A",
          milestones: milestoneList.map(m => ({
            description: m.description,
            amount: m.amount,
            status: m.status,
          })),
          budget: milestoneList.reduce((sum, m) => sum + Number(m.amount || 0), 0),
        };

        if (hasActiveMilestone) {
          active.push(job);
        } else {
          previous.push(job);
        }
      });
    });

    setActiveJobs(active);
    setPreviousJobs(previous);
  });

  return () => unsub(); 
}, []);

  const toggleExpand = (jobId) => {
        if (expandedJobId === jobId) 
          {
            setExpandedJobId(null);
          } 
          else 
          {
            setExpandedJobId(jobId);
          }

  };


  return (
    <>
      <HeaderFreelancer />

      <header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Contracts and Tasks</h1>
        </section>

        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/freelancer">Home</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <main className="contracts-tasks-container">
        <section className="contracts-section">
          <h2>Current Jobs</h2>
          {activeJobs.length === 0 ? (
            <p className="no-jobs-message">No active jobs available.</p>
          ) : (
            activeJobs.map((job) => (
              <section className="job-contract-card" key={job.id}>
                <h3>{job.title}</h3>
                <button className="expand-toggle" onClick={() => toggleExpand(job.id)}>
                  {expandedJobId === job.id ? 'Hide Details' : 'View Details'}
                </button>
                {expandedJobId === job.id && (
                  <section className="job-details">
                    <p><strong>Description:</strong> {job.description}</p>
                    <p><strong>Budget:</strong> R{job.budget}</p>
                    <p><strong>Deadline:</strong> {job.deadline}</p>
            
                    <h4>Milestones:</h4>
                    <section className="milestone-section">
                        <ul>
                            {job.milestones.map((m, index) => (
                            <li key={index} className="milestone">
                                <h4>{m.description}</h4>
                                <p><strong>Amount:</strong> R{m.amount}</p>
                                <p><strong>Status:</strong> {m.status}</p>
                            </li>
                            ))}
                        </ul>
                    </section>

                  </section>
                )}
              </section>
            ))
          )}
        </section>

        <section className="contracts-section">
          <h2>Previous Jobs</h2>
          {previousJobs.length === 0 ? (
            <p className="no-jobs-message">No previous jobs found.</p>
          ) : (
            previousJobs.map((job) => (
              <section className="job-contract-card" key={job.id}>
                <h3>{job.title}</h3>
                <button className="expand-toggle" onClick={() => toggleExpand(job.id)}>
                  {expandedJobId === job.id ? 'Hide Details' : 'View Details'}
                </button>
                {expandedJobId === job.id && (
                  <section className="job-details">
                    <p><strong>Description:</strong> {job.description}</p>
                    <p><strong>Budget:</strong> R{job.budget}</p>
                    <p><strong>Deadline:</strong> {job.deadline}</p>
                    
                    <h4>Milestones:</h4>
                    <section className="milestone-section">
                        <ul>
                            {job.milestones.map((m, index) => (
                            <li key={index} className="milestone">
                                <h4>{m.description}</h4>
                                <p><strong>Amount:</strong> R{m.amount}</p>
                                <p><strong>Status:</strong> {m.status}</p>
                            </li>
                            ))}
                        </ul>
                    </section>

                  </section>
                )}
              </section>
            ))
          )}
        </section>
      </main>

      <FooterClient />
    </>
  );
};

export default ConTasksFreelancer;

