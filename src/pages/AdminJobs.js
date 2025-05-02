import { Link } from "react-router-dom";

import React, { useEffect, useState } from 'react';
import '../stylesheets/AdminJobs.css';
import HeaderAdmin from "../components/HeaderAdmin";
import { get, ref, remove } from 'firebase/database';
import { db } from '../firebaseConfig';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    get(jobsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const jobsArray = Object.entries(snapshot.val()).map(([id, data]) => ({
            id,
            ...data,
          }));
          setJobs(jobsArray);
        } else {
          console.log('No jobs found.');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleDelete = (jobId) => {
    const jobRef = ref(db, `jobs/${jobId}`);
    remove(jobRef)
      .then(() => {
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
        alert('Job deleted successfully.');
      })
      .catch((error) => {
        console.error('Delete failed:', error);
        alert('Failed to delete job.');
      });
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
            <Link to="/Admin">Home</Link>


            </ul>
          </nav>
        </section>
      </header>

      <main className="admin-jobs-container">
        <div className="admin-job-list">
          {jobs.length === 0 ? (
            <p className="no-jobs-message">No jobs available.</p>
          ) : (
            jobs.map((job) => (
              <div className="admin-job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Category:</strong> {job.category}</p>
                <p><strong>Budget:</strong> ${job.budget}</p>
                <p><strong>Deadline:</strong> {job.deadline}</p>
                <button onClick={() => handleDelete(job.id)} className="delete-button">
                  Delete Job Permanently
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
};

export default AdminJobs;
