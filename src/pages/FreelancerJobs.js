import  { useEffect, useState } from 'react';
import '../stylesheets/FreelancerJob.css';
import HeaderFreelancer from '../components/HeaderFreelancer';

import { get, push, ref, onValue } from "firebase/database";
import { db, applications_db } from '../firebaseConfig';

const FreelancerJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [jobs, setjobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [rejectedJobs, setRejectedJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);

  const [applicationData, setApplicationData] = useState({
    name: '',
    surname: '',
    skills: '',
    motivation: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => 
    {
  const userUID = localStorage.getItem("userUID");
  const jobsRef = ref(db, 'jobs');

  const applicationsRef = ref(applications_db, 'accepted_applications');
  const rejectedRef = ref(applications_db, `rejected_applications`);

      const pendingApplicationsRef = ref(applications_db, 'applications');


  get(jobsRef).then((snapshot) => {
    if (snapshot.exists()) {
      const jobsArray = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
      setjobs(jobsArray);
    } 
  }).catch((error) => {
    console.error(error);
  });

  get(applicationsRef).then((snapshot) => 
    {
    if (snapshot.exists()) 
      {
      const applicationsData = snapshot.val();
      const userAppliedJobIds = [];

      const userAcceptedJobIds = [];
      const userRejectedJobIds = [];


      Object.entries(applicationsData).forEach(([jobId, jobApplications]) => 
        {
        Object.values(jobApplications).forEach((application) => 
          {

          if (application.applicant_userUID === userUID) 
            {
            userAppliedJobIds.push(jobId);

            if (application.status === "accepted") 
              {

                userAcceptedJobIds.push(jobId);

            } else if (application.status === "rejected") 
            {
              userRejectedJobIds.push(jobId);
            }
          }
        });
      });

      setAppliedJobs(prev => [...new Set([...prev, ...userAppliedJobIds])]);

      setAcceptedJobs(userAcceptedJobIds);
    }
  });

  onValue(rejectedRef, (snapshot) => 
    {
    const data = snapshot.val();

    if (!data) return;

    const userRejectedJobIds = [];

    for (const jobId in data) 
      {

      for (const applicantId in data[jobId]) 
        {

        const appData = data[jobId][applicantId];
        
        if (appData.applicant_userUID === userUID) 
          {

          userRejectedJobIds.push(jobId);
        }
      }
    }

    setRejectedJobs(userRejectedJobIds);
  });


  get(pendingApplicationsRef).then((snapshot) => 
    {
    if (snapshot.exists()) 
      {
      const applicationsData = snapshot.val();

      const userPendingJobIds = [];

      Object.entries(applicationsData).forEach(([jobId, jobApplications]) => 
        {
        Object.values(jobApplications).forEach((application) => {

          if (application.applicant_userUID === userUID && application.status === "pending") 
            {

            userPendingJobIds.push(jobId);
          }
        });
      });

      setPendingJobs(prev => [...new Set([...prev, ...userPendingJobIds])]);

      setAppliedJobs(prev => [...new Set([...prev, ...userPendingJobIds])]);
    }
  });
}, []);


  const filteredJobs = jobs.filter(job => 
    {
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

  const handleSubmit = () => 
    {
      const errors = {};
      for (const [key, value] of Object.entries(applicationData)) {
        if (!value || value.trim?.() === "") {
          errors[key] = `Please fill in the ${key.replace(/_/g, ' ')} field.`;
        }
      }
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({}); //for error handling
    if (appliedJobs.includes(selectedJob.id)) 
      {

      alert("You have already applied to this job.");

      return;
    }
    const applicationsRef = ref(applications_db, `applications/${selectedJob.id}`);
    push(applicationsRef, {
      ...applicationData,
      applicant_userUID: localStorage.getItem("userUID"),
      jobTitle: selectedJob.title,
      deadline: selectedJob.deadline,
      job_description: selectedJob.description,
      status: "pending",
      clientUID : selectedJob.clientUID,
      job_milestones: selectedJob.milestones,
    }).then(() => {
      alert("✅ Thank you for applying. You will hear a response soon.");
      setAppliedJobs(prev => [...prev, selectedJob.id]);
      setPendingJobs(prev => [...prev, selectedJob.id]);
      closeModal();
    }).catch((error) => {
      alert("❌ Failed to submit application: " + error.message);
    });
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

        {/* Available Jobs */}
        <section className="job-listings job-column">
          <h2>Available Jobs</h2>
          {filteredJobs.filter(job =>
            !acceptedJobs.includes(job.id) &&
            !rejectedJobs.includes(job.id)
          ).length > 0 ? (
            filteredJobs
              .filter(job =>
                !acceptedJobs.includes(job.id) &&
                !rejectedJobs.includes(job.id)
              )
              .map(job => (
                <section key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <p><strong>Description:</strong> {job.description}</p>
                  <p><strong>Category:</strong> {job.category}</p>
                  <p><strong>Budget:</strong> ${job.budget}</p>
                  <p><strong>Deadline:</strong> {job.deadline}</p>

                  {job.milestones && job.milestones.length > 0 && (
                    <section className="milestones-section">
                      <h4>Milestones:</h4>
                      <ul>
                        {job.milestones.map((milestone, index) => (
                          <li key={index}>
                            <p><strong>Milestone {index + 1}:</strong> {milestone.description}</p>
                            <p><strong>Amount:</strong> ${milestone.amount}</p>
                            <p><strong>Due Date:</strong> {milestone.duedate} </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {pendingJobs.includes(job.id) ? (
                    <p className="status-label pending">⏳ Application Pending</p>
                  ) : (
                    <button onClick={() => openModal(job)}>Apply</button>
                  )}
                </section>
              ))
          ) : (
            <p>No available jobs.</p>
          )}
        </section>

        {}
        <section className="job-listings job-column">
          <h2>Accepted Jobs</h2>
          {filteredJobs.filter(job => acceptedJobs.includes(job.id)).length > 0 ? (
            filteredJobs
              .filter(job => acceptedJobs.includes(job.id))
              .map(job => (
                <section key={job.id} className="job-card accepted">
                  <h3>{job.title}</h3>
                  <p><strong>Description:</strong> {job.description}</p>
                  <p><strong>Category:</strong> {job.category}</p>
                  <p><strong>Budget:</strong> ${job.budget}</p>
                  <p><strong>Deadline:</strong> {job.deadline}</p>
                  {job.milestones && job.milestones.length > 0 && (
                    <section className="milestones-section">
                      <h4>Milestones:</h4>
                      <ul>
                        {job.milestones.map((milestone, index) => (
                          <li key={index}>
                            <p><strong>Milestone {index + 1}:</strong> {milestone.description}</p>
                            <p><strong>Amount:</strong> ${milestone.amount}</p>
                            <p><strong>Due Date:</strong> {milestone.duedate} </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <p className="status-label done">✅ Accepted</p>
                </section>
              ))
          ) : (
            <p>No accepted jobs.</p>
          )}
        </section>

        {/* Rejected Jobs */}
        <section className="job-listings job-column">
          <h2>Rejected Jobs</h2>
          {filteredJobs.filter(job => rejectedJobs.includes(job.id)).length > 0 ? (
            filteredJobs
              .filter(job => rejectedJobs.includes(job.id))
              .map(job => (
                <section key={job.id} className="job-card rejected">
                  <h3>{job.title}</h3>
                  <p><strong>Description:</strong> {job.description}</p>
                  <p><strong>Category:</strong> {job.category}</p>
                  <p><strong>Budget:</strong> ${job.budget}</p>
                  <p><strong>Deadline:</strong> {job.deadline}</p>
                  {job.milestones && job.milestones.length > 0 && (
                    <section className="milestones-section">
                      <h4>Milestones:</h4>
                      <ul>
                        {job.milestones.map((milestone, index) => (
                          <li key={index}>
                            <p><strong>Milestone {index + 1}:</strong> {milestone.description}</p>
                            <p><strong>Amount:</strong> ${milestone.amount}</p>
                            <strong>Due Date:</strong> {milestone.duedate} <br />
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <p className="status-label rejected">❌ Rejected</p>
                </section>
              ))
          ) : (
            <p>No rejected jobs.</p>
          )}
        </section>
      </main>

      {}
      {showModal && selectedJob && (
        <section className="modal-overlay">
          <section className="modal">
            <h2>Apply for {selectedJob.title}</h2>
            <form>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={applicationData.name}
                onChange={handleChange}
                className={formErrors.name ? "input-error" : ""}
              />
              {formErrors.name && <p className="error-text">{formErrors.name}</p>}

              <label>Surname:</label>
              <input
                type="text"
                name="surname"
                placeholder="Enter your surname"
                value={applicationData.surname}
                onChange={handleChange}
                className={formErrors.surname ? "input-error" : ""}
              />
              {formErrors.surname && <p className="error-text">{formErrors.surname}</p>}

              <label>Skills (comma separated):</label>
              <input
                type="text"
                name="skills"
                placeholder="e.g., JavaScript, React, Firebase"
                value={applicationData.skills}
                onChange={handleChange}
                className={formErrors.skills ? "input-error" : ""}
              />
              {formErrors.skills && <p className="error-text">{formErrors.skills}</p>}

              <label>Motivation:</label>
              <textarea
                name="motivation"
                placeholder="Write your motivation here..."
                rows={5}
                value={applicationData.motivation}
                onChange={handleChange}
                className={formErrors.motivation ? "input-error" : ""}
              ></textarea>

              {formErrors.motivation && <p className="error-text">{formErrors.motivation}</p>}
              
              <section className="modal-buttons">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="button" className="submit-button" onClick={handleSubmit}>
                  Submit
                </button>
              </section>
            </form>
          </section>
        </section>
      )}
    </>
  );
};

export default FreelancerJobs;
