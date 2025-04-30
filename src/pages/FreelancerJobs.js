import React, { useEffect, useState } from 'react';
import '../stylesheets/FreelancerJob.css';
import HeaderFreelancer from '../components/HeaderFreelancer';

import { get, ref } from "firebase/database";
import { db } from '../firebaseConfig';

const FreelancerJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [jobs, setjobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  // 🆕 Application form state
  const [applicationData, setApplicationData] = useState({
    name: '',
    surname: '',
    skills: '',
    motivation: '',
  });

  // 🆕 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    get(jobsRef).then((snapshot) => {
      if (snapshot.exists()) {
        const jobsArray = Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data,
        }));
        setjobs(jobsArray);
      } else {
        console.log('No data available');
      }
    }).catch((error) => {
      console.error(error);
    });
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || job.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openModal = (job) => {
    setSelectedJob(job);
    setShowModal(true);
    setApplicationData({
      name: '',
      surname: '',
      skills: '',
      motivation: '',
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  const handleSubmit = () => {
    alert("Thank you for applying. You will hear a response soon.");
    setAppliedJobs([...appliedJobs, selectedJob.id]);
    closeModal();
  };

  return (
    <>
      <HeaderFreelancer />

      <header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Freelancer Job Board</h1>
        </section>

        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/freelancer">Home</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <main className="freelancer-jobs-main">
        <aside className="sidebar">
          <h3>Filter Jobs</h3>
          <input
            type="text"
            placeholder="Search by job title"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <label>Category</label>
          <select onChange={e => setCategoryFilter(e.target.value)} value={categoryFilter}>
            <option value="All">All</option>
            <option value="Web Design">Web Design</option>
            <option value="App Development">App Development</option>
            <option value="Design">Design</option>
            <option value="Admin Support">Admin Support</option>
          </select>
        </aside>

        <section className="job-listings">
          <h2>Available Jobs</h2>
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Category:</strong> {job.category}</p>
                <p><strong>Budget:</strong> ${job.budget}</p>
                <p><strong>Deadline:</strong> {job.deadline}</p>
                <button onClick={() => openModal(job)}>
                  {appliedJobs.includes(job.id) ? "Submit" : "Apply"}
                </button>
              </div>
            ))
          ) : (
            <p>No jobs found.</p>
          )}
        </section>
      </main>

      {showModal && selectedJob && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Apply for {selectedJob.title}</h2>
            <form>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={applicationData.name}
                onChange={handleChange}
              />

              <label>Surname:</label>
              <input
                type="text"
                name="surname"
                placeholder="Enter your surname"
                value={applicationData.surname}
                onChange={handleChange}
              />

              <label>Skills (comma separated):</label>
              <input
                type="text"
                name="skills"
                placeholder="e.g., JavaScript, React, Firebase"
                value={applicationData.skills}
                onChange={handleChange}
              />

              <label>Motivation:</label>
              <textarea
                name="motivation"
                placeholder="Write your motivation here..."
                rows={5}
                value={applicationData.motivation}
                onChange={handleChange}
              ></textarea>

              <div className="modal-buttons">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="button" className="submit-button" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FreelancerJobs;
