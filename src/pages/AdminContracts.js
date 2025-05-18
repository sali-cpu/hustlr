import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { db,applications_db } from '../firebaseConfig';
import HeaderAdmin from "../components/HeaderAdmin";

const AdminReports = () => {
 const [clients, setClients] = useState([]);         
  const [ setFreelancers] = useState([]); 

useEffect(() => 
    
    {
  const fetchData = async () => 
    {
    try 
    {
      const usersRef = ref(applications_db, 'Information');

      const usersSnapshot = await get(usersRef);

      const clientsArray = [];
      const freelancersArray = [];
      const clientJobsMap = {};
      const freelancerJobsMap = {};

      if (usersSnapshot.exists()) 
        
        {
        const usersData = usersSnapshot.val();

        Object.entries(usersData).forEach(([userUID, user]) =>
            
            {
          const userData = {
            id: userUID,
            bio: user.bio,
            professtion: user.profession,
            skills: user.skills,
            totalJobs: user.totalJobs,
          };

          if (user.role === 'Client') 
            {
            clientsArray.push(userData);

          } 
          else if (user.role === 'Freelancer') 
            {


                    freelancersArray.push(userData);
          }
        });
      }

      const jobsRef = ref(db, 'jobs');
      const jobsSnapshot = await get(jobsRef);
      const allJobs = jobsSnapshot.exists() ? jobsSnapshot.val() : {};

      const appsRef = ref(applications_db, 'accepted_applications');
      const appsSnapshot = await get(appsRef);
      const applicationsData = appsSnapshot.exists() ? appsSnapshot.val() : {};

      
      clientsArray.forEach((client) => {
        const clientJobs = Object.entries(allJobs).filter(
          ([_, job]) => job.clientUID === client.id
        );

        const previousJobs = [];

        const activeJobs = [];
        clientJobs.forEach(([jobId, job]) => 
            {
          const jobApplications = applicationsData[jobId];

          let acceptedApp = null;
          if (jobApplications) 
            {
            acceptedApp = Object.values(jobApplications).find(
              (app) => app.status === 'accepted'
            );
          }

          const freelancerName = acceptedApp?.name || 'Unknown Freelancer';
          if (acceptedApp && acceptedApp.job_milestones) 
            {
            const milestones = Object.values(acceptedApp.job_milestones);
            const allDone = milestones.every((m) => m.status === 'Done');

            const jobWithFreelancer = {
              ...job,
              milestones,
              freelancerName,
            };

            if (allDone) 
            {
              previousJobs.push(jobWithFreelancer);
            } 
            else 
            {
              activeJobs.push(jobWithFreelancer);
            }
          } 
          else 
          {
            activeJobs.push({
              ...job,
              milestones: [],
              freelancerName,
            }); 
          }
        });

        clientJobsMap[client.id] = { previousJobs, activeJobs };
      });

      Object.entries(applicationsData).forEach(([jobId, jobApplications]) => {
        Object.entries(jobApplications).forEach(([freelancerUID, application]) => {
          if (application.status === 'accepted') {
            const milestones = Object.values(application.job_milestones || {});
            const isCompleted = milestones.every((m) => m.status === 'Done');
            const category = isCompleted ? 'completed' : 'active';

            if (!freelancerJobsMap[freelancerUID]) {
              freelancerJobsMap[freelancerUID] = { completed: [], active: [] };
            }

            freelancerJobsMap[freelancerUID][category].push({
              jobId,
              milestones,
              ...allJobs[jobId],
            });
          }
        });
      });

      const enrichedFreelancers = freelancersArray.map((freelancer) => {
        const jobs = freelancerJobsMap[freelancer.id] || { completed: [], active: [] };
        return {
          ...freelancer,
          completedJobs: jobs.completed,
          activeJobs: jobs.active,
        };
      });

      const enrichedClients = clientsArray.map((client) => {
        const jobs = clientJobsMap[client.id] || { previousJobs: [], activeJobs: [] };
        return {
          ...client,
          previousJobs: jobs.previousJobs,
          activeJobs: jobs.activeJobs,
        };
      });

      setClients(enrichedClients);
      setFreelancers(enrichedFreelancers);
    } catch (error) {
      alert("Error fetching data:", error.message);
    }
  };

  fetchData();
}, []);


  return (
    <>
      <HeaderAdmin />
      <header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Admin Contracts Management</h1>
        </section>

        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/Admin">Home</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <main className="admin-jobs-container">

  {}
  <section className="admin-user-section">
    <h2>Clients</h2>
    <section className="admin-job-list">
      {clients.length === 0 ? (
        <p className="no-jobs-message">No clients found.</p>
      ) : (
        clients.map((client, index) => (
          <section className="admin-job-card" key={client.id}>
            <h3>Client {index}</h3>
            <p><strong>Bio:</strong> {client.bio || 'N/A'}</p>
            <p><strong>Jobs with experience:</strong> {client.totalJobs || 0}</p>

            
            {}
                    <section className="job-section">
                    <h4>Active Jobs</h4>
                    {client.activeJobs.length === 0 ? (
                     <p>No active jobs.</p>
                    ) : (
                    client.activeJobs.map((job, i) => (
                <section key={i} className="job-card">
                    <p><strong>Title:</strong> {job.title || 'Untitled'}</p>
                    <p><strong>Description:</strong> {job.description || 'N/A'}</p>
                     <p><strong>Freelancer:</strong> {job.freelancerName}</p>
                    <p><strong>Milestones:</strong></p>
                 <ul>
                {job.milestones?.map((m, j) => (
                <li key={j}>{m.title || `Milestone ${j + 1}`}: {m.description}</li>
                ))}
                </ul>
      </section>
    ))
  )}
</section>

                    {}
                    <section className="job-section">
                        <h4>Previous Jobs</h4>
                    {client.previousJobs.length === 0 ? (
                    <p>No completed jobs.</p>
                    ) : (
                    client.previousJobs.map((job, i) => (
                    <section key={i} className="job-card">
                    <p><strong>Title:</strong> {job.title || 'Untitled'}</p>
                    <p><strong>Description:</strong> {job.description || 'N/A'}</p>
                    <p><strong>Freelancer:</strong> {job.freelancerName}</p>
                    <p><strong>Milestones:</strong></p>
                    <ul>
                    {job.milestones?.map((m, j) => (
                    <li key={j}>{m.title || `Milestone ${j + 1}`}: {m.description}</li>
                    ))}
                </ul>
                </section>
                ))
         )}
        </section>

          </section>
        ))
      )}
    </section>
  </section>

  

</main>

    </>
  );
};

export default AdminReports;
