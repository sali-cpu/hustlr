import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import '../stylesheets/AdminJobs.css';
import HeaderAdmin from "../components/HeaderAdmin";
import { get, ref, remove } from 'firebase/database';
import { db,applications_db } from '../firebaseConfig';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    get(jobsRef)
      .then((snapshot) => {
        if (snapshot.exists()) 
          {
          const jobsArray = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data,
          }));
          setJobs(jobsArray);
        } 
        else 
        {
          alert("No Jobs found.");
        }
      })
      .catch((error) => {
        alert(error.message);
      });
  }, []);

   const handleDelete = async (jobId) => {
  try {
    // References to all locations where the job might exist
    const jobRef = ref(db, `jobs/${jobId}`);
    const applicationRef = ref(applications_db, `applications/${jobId}`);
    const acceptedAppRef = ref(applications_db, `accepted_applications/${jobId}`);
    const rejectedAppRef = ref(applications_db, `rejected_applications/${jobId}`);

    // Delete from all relevant database paths
    await remove(jobRef);
    await remove(applicationRef);
    await remove(acceptedAppRef);
    await remove(rejectedAppRef);

    // Remove from local state
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));

    alert('Job and all associated applications deleted successfully.');
  } catch (error) {
    alert(`Error deleting job: ${error.message}`);
  }
};


return (
  <>
    <HeaderAdmin />

    <header className="client-jobs-header">
      <section className="header-title-area">
        <h1 className="main-title">Admin Job Management</h1>
      </section>

      <section className="nav_section">
        <nav className="main-nav">
          <ul>
            <li><Link to="/Admin">Home</Link></li>
          </ul>
        </nav>
      </section>
    </header>

    <main className="admin-jobs-container">
      <section className="admin-job-list">
        {(() => 
        {
          if (jobs.length === 0)  //checking if jobs are available
            {
              return <p className="no-jobs-message">No jobs available.</p>;
            } 


          else 
          {
            return jobs.map((job) => (
              <section className="admin-job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Category:</strong> {job.category}</p>
                <p><strong>Budget:</strong> ${job.budget}</p>
                <p><strong>Deadline:</strong> {job.deadline}</p>
                <button onClick={() => handleDelete(job.id)}
                  className="delete-button" > Delete Job Permanently </button>
              </section>
            ));
          }
        })()}
      </section>
    </main>
  </>
);

};

export default AdminJobs;
