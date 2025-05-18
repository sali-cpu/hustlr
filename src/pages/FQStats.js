import React from 'react';
import '../stylesheets/FQStats.css';
import FooterClient from "../components/FooterClient";
import HeaderFreelancer from '../components/HeaderFreelancer';
import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { applications_db } from '../firebaseConfig';

const FQStats = () => {
  const [stats, setStats] = useState({
    jobsApplied: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalEarned: 0
  });

  const userUID = localStorage.getItem("userUID");

  useEffect(() => {
    const fetchFreelancerStats = async () => {
      if (!userUID) {
        alert("No userUID found.");
        return;
      }

      try {
        const appsRef = ref(applications_db, 'accepted_applications');
        const appsSnapshot = await get(appsRef);

        let jobsApplied = 0;
        let activeJobs = 0;
        let completedJobs = 0;
        let totalEarned=0;

        if (appsSnapshot.exists()) 
          {
          const allApplications = appsSnapshot.val();

          Object.entries(allApplications).forEach(([jobId, applications]) => {
            Object.values(applications).forEach((application) => {
              if (application.applicant_userUID === userUID) 
                {
                jobsApplied++;

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
                    totalEarned=totalEarned+parseFloat(milestones[2].amount);
                  }
                  
                  if (milestones[1].status==="Done") {
                    totalEarned=totalEarned+parseFloat(milestones[1].amount);
                  }
                  if (milestones[0].status==="Done") {
                    totalEarned=totalEarned+parseFloat(milestones[0].amount);
                  }

                  //if job is done

                  if (milestones[0].status==="Done" &&  milestones[1].status==="Done" && milestones[2].status==="Done")
                  {
                      activeJobs--;
                  }

                }
              }
              }
            });
          });
        }


        setStats({
          jobsApplied,
          activeJobs,
          completedJobs,
          totalEarned
        });
      } catch (error) {
        alert("Error fetching freelancer stats:", error.message);
      }
    };

    fetchFreelancerStats();
  }, []);

  return (
    <>
      <HeaderFreelancer />

      <main className="fqstats-main">
        <header className="fqstats-header">
          <section className="header-title-area">
            <h1 className="main-title">Freelancer Reports</h1>
          </section>

          <nav className="main-nav" aria-label="Primary navigation">
            <ul>
              <li><a href="/Freelancer">Home</a></li>
            </ul>
          </nav>
        </header>

        <section aria-label="Client statistics" className="stats-section">
          <article aria-labelledby="jobs-posted-heading">
            <h2 id="jobs-posted-heading">Jobs Applied to</h2>
            <p>{stats.jobsApplied}</p>
            <meter 
              min="0" 
              max="10" 
              value={stats.jobsApplied}
              aria-label={`${stats.jobsApplied} out of 10 jobs applied to`}
            ></meter>
          </article>

          <article aria-labelledby="active-jobs-heading">
            <h2 id="active-jobs-heading">Active Jobs</h2>
            <p>{stats.activeJobs}</p>
            <progress 
              max={stats.jobsApplied} 
              value={stats.activeJobs}
              aria-label={`${stats.activeJobs} active jobs out of ${stats.jobsApplied} total`}
            ></progress>
          </article>

          <article aria-labelledby="completed-jobs-heading">
            <h2 id="completed-jobs-heading">Completed Jobs</h2>
            <p>{stats.completedJobs}</p>
            <progress 
              max={stats.jobsApplied} 
              value={stats.completedJobs}
              aria-label={`${stats.completedJobs} jobs completed out of ${stats.jobsApplied} total`}
            ></progress>
          </article>

          <article aria-labelledby="total-spent-heading">
            <h2 id="total-spent-heading">Total Earned</h2>
            <p>${stats.totalEarned.toLocaleString()}</p>
          </article>
        </section>
      </main>
      <FooterClient />
    </>
  );
};

export default FQStats;
