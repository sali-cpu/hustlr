import '../stylesheets/CQStats.css';
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";
import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db, applications_db } from '../firebaseConfig';

const userUID = localStorage.getItem("userUID");
const CQStats = ( ) => {
  const [stats, setStats] = useState({
    jobsPosted: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalSpent: 0,
  });

useEffect(() => {
  const fetchStats = async () => {
    if (!userUID) {
      console.warn("No userUID found.");
      return;
    }

    try {
      
      const jobsRef = ref(db, 'jobs');
      const jobsSnapshot = await get(jobsRef);

      let jobsPosted = 0;
      let jobsByClient = {};

      if (jobsSnapshot.exists()) {
        const allJobs = jobsSnapshot.val();

        Object.entries(allJobs).forEach(([jobId, job]) => {
          if (job.clientUID === userUID) {
            jobsPosted++;
            jobsByClient[jobId] = job;
          }
        });
      } else {
        alert("No jobs found.");
      }

      const appsRef = ref(applications_db, 'accepted_applications');
      const appsSnapshot = await get(appsRef);

      let activeJobs = 0;
      let completedJobs=0;
      let totalSpent=0;

      if (appsSnapshot.exists()) {
        const applicationsData = appsSnapshot.val();
        
        Object.entries(applicationsData).forEach(([jobId, jobApplications]) => {
          if (jobsByClient[jobId]) {
            Object.values(jobApplications).forEach((application) => {
              if (application.status === "accepted") 
                {
                activeJobs++;

                if (application.job_milestones) 
                  {
                  const milestones = Object.values(application.job_milestones);

                  if (milestones[2].status==="Done" && milestones[1].status==="Done" && milestones[0].status==="Done") {
                    completedJobs++;
                  }
                  
                  if (milestones[2].status==="Done") {
                    totalSpent=totalSpent+parseFloat(milestones[2].amount);
                  }
                  
                  if (milestones[1].status==="Done") {
                    totalSpent=totalSpent+parseFloat(milestones[1].amount);
                  }
                  if (milestones[0].status==="Done") {
                    totalSpent=totalSpent+parseFloat(milestones[0].amount);
                  }
                      if (milestones[0].status==="Done" &&  milestones[1].status==="Done" && milestones[2].status==="Done")
                  {
                      activeJobs--;
                  }
                }
              }
            });
          }
        });
        
      } else {
        alert("No accepted_applications found.");
      }
        
      setStats(prev => ({
        ...prev,
        jobsPosted,
        activeJobs,
        completedJobs,
        totalSpent
      }));
    } catch (error) {
      alert("Error fetching job/application stats:", error.message);
    }
  };

  fetchStats();
}, []);


  return (

    <>
    <HeaderClient />

    <main className="cqstats-main">
      <header className="cqstats-header">
        <section className="header-title-area">
          <h1 className="main-title">Client Reports</h1>
        </section>

        <nav className="main-nav" aria-label="Primary navigation">
          <ul>
            <li><a href="/client">Home</a></li>
          </ul>
        </nav>
      </header>

      <section aria-label="Client statistics" className="stats-section">
        <article aria-labelledby="jobs-posted-heading">
          <h2 id="jobs-posted-heading">Jobs Posted</h2>
          <p>{stats.jobsPosted}</p>
          <meter 
            min="0" 
            max="10" 
            value={stats.jobsPosted}
            aria-label={`${stats.jobsPosted} out of 10 jobs posted`}
          ></meter>
        </article>

        <article aria-labelledby="active-jobs-heading">
          <h2 id="active-jobs-heading">Active Jobs</h2>
          <p>{stats.activeJobs}</p>
          <progress 
            max={stats.jobsPosted} 
            value={stats.activeJobs}
            aria-label={`${stats.activeJobs} active jobs out of ${stats.jobsPosted} total`}
          ></progress>
        </article>

        <article aria-labelledby="completed-jobs-heading">
          <h2 id="completed-jobs-heading">Completed Jobs</h2>
          <p>{stats.completedJobs}</p>
          <progress 
            max={stats.jobsPosted} 
            value={stats.completedJobs}
            aria-label={`${stats.completedJobs} jobs completed out of ${stats.jobsPosted} total`}
          ></progress>
        </article>

        <article aria-labelledby="total-spent-heading">
          <h2 id="total-spent-heading">Total Spent</h2>
          <p>${stats.totalSpent.toLocaleString()}</p>
        </article>
      </section>
    </main>
    <FooterClient />
    </>
  );
};

export default CQStats;
