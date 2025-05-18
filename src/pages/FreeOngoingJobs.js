import { useEffect, useState } from 'react';
import { ref, get /*, update */ } from "firebase/database";
import { applications_db } from '../firebaseConfig';
import HeaderFreelancer from '../components/HeaderFreelancer';
import FooterClient from '../components/FooterClient';
import '../stylesheets/FreeOngoingJobs.css';

const FreeOngoingJobs = () => {
  const [ongoingJobs, setOngoingJobs] = useState([]);
  

  useEffect(() => {
      const fetchAcceptedJobs = async () => {
      const userUID = localStorage.getItem("userUID");
      
      if (!userUID) {
        console.error("User UID not found in localStorage.");
        setOngoingJobs([]);
        return;
      }
      
      const acceptedRef = ref(applications_db, 'accepted_applications');
      const jobsMap = {};

      try {
        const snapshot = await get(acceptedRef);

        if (snapshot.exists()) {
          snapshot.forEach(parentSnap => {
            parentSnap.forEach(jobSnap => {
              const data = jobSnap.val();

              if (
                data.applicant_userUID === userUID &&
                Array.isArray(data.job_milestones)
              ) {
                const jobKey = jobSnap.key;
                

                jobsMap[jobKey] = {
                id: jobKey,
                title: data.jobTitle || 'Untitled Job',
                milestones: [],
                totalAmount: 0,
                paidAmount: 0
                };

                data.job_milestones.forEach((milestone, index) => {
                  const milestoneAmount = parseFloat(milestone.amount) || 0;

                  jobsMap[jobKey].milestones.push({
                    name: milestone.description || `Milestone ${index + 1}`,
                    completed: milestone.status === 'Done',
                    amount: milestoneAmount,
                    status: milestone.status || 'Pending',
                    dueDate: milestone.dueDate || 'N/A'
                  });

                  jobsMap[jobKey].totalAmount += milestoneAmount;

                  if (milestone.status === 'Done') {
                    jobsMap[jobKey].paidAmount += milestoneAmount;
                  }
                });
              }
            });
          });

          const jobList = Object.values(jobsMap);
          setOngoingJobs(jobList);
        } else {
          console.log("No accepted jobs found for this user.");
          setOngoingJobs([]);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setOngoingJobs([]);
      }
    };

    fetchAcceptedJobs();
  }, []);

  return (
    <>
      <HeaderFreelancer />

      <main className="ongoing-jobs">
        <header className="jobs-header">
          <h1>Ongoing Jobs</h1>
          <p>Active work in progress</p>
          <nav className="main-nav">
            <ul>
              <li><a href="/Freelancer">Home</a></li> 
            </ul>
          </nav>
        
        </header>

        {ongoingJobs.length === 0 ? (
          <p>No ongoing jobs found.</p>
        ) : (
          <section className="jobs-list">
            {ongoingJobs.map(job => (
              <article key={job.id} className="job-card">
                <header>
                  <h2>{job.title}</h2>
                </header>

                <section className="job-progress">
                  <h3>Milestones</h3>
                  <ol>
                    {job.milestones.map((milestone, index) => (
                      <li
                        key={index}
                        className={milestone.completed ? 'completed' : ''}
                      >
                        {milestone.name}
                      </li>
                    ))}
                  </ol>
                  <p>
                    Completed: {job.milestones.filter(m => m.completed).length}/
                    {job.milestones.length}
                  </p>
                </section>

                <section className="job-financial">
                  <h3>Financials</h3>
                  <p>Total: ${job.totalAmount.toLocaleString()}</p>
                  <p>Paid: ${job.paidAmount.toLocaleString()}</p>
                </section>
              </article>
            ))}
          </section>
        )}
      </main>
      <FooterClient/>
    </>
  );
};

export default FreeOngoingJobs;
