import React, { useState, useEffect, useRef } from 'react';
import '../stylesheets/ClientJobs.css';
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";

import { db, applications_db } from '../firebaseConfig';
import { get, ref, push, set, update, remove, onValue } from "firebase/database";

const initialFormData = {
  title: '',
  description: '',
  category: '',
  budget: '',
  deadline: '',
  milestones: [
    { description: '', amount: '' },
    { description: '', amount: '' },
    { description: '', amount: '' }
  ] //newly added 
};

const userUID = localStorage.getItem("userUID");
//alert("User UID at load: " + userUID);

const ClientJobs = () => {
  const [jobs, setJobsList] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [editingJobId, setEditingJobId] = useState(null);
  const formSectionRef = useRef(null);
  const [viewingApplicantsJobId, setViewingApplicantsJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  //newly added 
  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index][field] = value;
    setFormData({ ...formData, milestones: updatedMilestones });
  };
  
  const handleEditClick = (jobToEdit) => {
    setEditingJobId(jobToEdit.id);
    setFormData({
      title: jobToEdit.title,
      description: jobToEdit.description,
      category: jobToEdit.category,
      budget: jobToEdit.budget,
      deadline: jobToEdit.deadline,
      milestones: jobToEdit.milestones ?? [
        { description: '', amount: '' },
        { description: '', amount: '' },
        { description: '', amount: '' }
      ]
    });
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleViewApplicants = async (jobId, jobTitle) => {
    setViewingApplicantsJobId(jobId);
    setSelectedJobTitle(jobTitle);
  
    const applicantsRef = ref(applications_db, `applications/${jobId}`);
  
    try {
      const snapshot = await get(applicantsRef);
  
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedApplicants = Object.entries(data).map(([key, appData]) => ({
          id: key,
          user_UID: appData.applicant_userUID || '',
          name: appData.name || '',
          surname: appData.surname || '',
          motivation: appData.motivation || '',
          skills: appData.skills || '',
          email: localStorage.getItem("userEmail")
        }));
        setApplicants(loadedApplicants);
      } else {
        setApplicants([]);
      }
  
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  
    } catch (error) {
      console.error("❌ Error fetching applicants:", error);
      alert("Failed to load applicants.");
    }
  };
  const handleAcceptApplicant = (applicantId) => {
    // Placeholder for backend accept logic
    alert(`✅ Accepted applicant with ID: ${applicantId}`);
  };
  
  const handleRejectApplicant = (applicantId) => {
    // Placeholder for backend reject logic
    alert(`❌ Rejected applicant with ID: ${applicantId}`);
  };
  

  const handleDelete = async (jobIdToDelete) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    const jobRef = ref(db, `jobs/${jobIdToDelete}`);
    await remove(jobRef);
    //alert("Job deleted from Firebase");
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setFormData(initialFormData);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //alert("User UID during submit: " + userUID);

    if (!formData.title || !formData.description || !formData.category || !formData.budget || !formData.deadline) {
      setError('⚠️ Please fill in all fields.');
      return;
    }

    setError('');

    try {
      if (editingJobId) {
        const jobRef = ref(db, `jobs/${editingJobId}`);
        await update(jobRef, {
          ...formData,
          budget: parseFloat(formData.budget),
        });
        //alert("✅ Job updated in Firebase");
      } else {
        const newJobRef = push(ref(db, "jobs"));
        await set(newJobRef, {
          ...formData,
          budget: parseFloat(formData.budget),
          clientUID: localStorage.getItem("userUID"),
        });
        //alert("✅ Job added to Firebase");
      }

      setFormData(initialFormData);
      setEditingJobId(null);

    } catch (error) {
      console.error("🔥 Failed to add/update job:", error);
      setError("⚠️ Error: " + error.message);
      alert("❌ Failed to add job: " + error.message);
    }
  };

  useEffect(() => {
    const jobsRef = ref(db, 'jobs');
    const unsubscribe = onValue(jobsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedJobs = [];

      for (const id in data) {
        if (data[id].clientUID === userUID) {
          loadedJobs.push({ id, ...data[id] });
        }
      }
      setJobsList(loadedJobs);
    });

    return () => unsubscribe();
  }, [userUID]);

  return (
    <>
      <HeaderClient />

      <header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Jobs for Clients</h1>
        </section>
        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/client">Home</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <main className="client-jobs-container">

        <section className="posted-jobs-section">
          <h2>Your Posted Jobs</h2>
          <ul className="jobs-list">
            {jobs.length === 0 ? (
              <li className="no-jobs-message"><p>You haven't posted any jobs yet.</p></li>
            ) : (
              jobs.map(job => (
                <li key={job.id}>
                  <article className="job-card">
                    <header className="job-card-header">
                      <h3>{job.title}</h3>
                      <p><strong>Category:</strong> {job.category}</p>
                    </header>
                    <p><strong>Budget:</strong> ${job.budget ? job.budget.toLocaleString() : 'N/A'}</p>
                    <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline + 'T00:00:00').toLocaleDateString() : 'N/A'}</p>
                    <p className="job-description"><strong>Description:</strong> {job.description}</p>
                    
                    {/* Display Milestones */}
                    {job.milestones && job.milestones.length > 0 && (
                  <section className="milestones">
                  <h4>Milestones:</h4>
                  <ul>
                    {job.milestones.map((milestone, index) => (
                        <li key={index}>
                        <p><strong>Milestone {index + 1}:</strong></p>
                         <p>{milestone.description}</p>
                        <p><strong>Amount:</strong> ${milestone.amount}</p>
                      </li>
                    ))}
                 </ul>
                 </section>
                )}


                    <footer className="job-actions">
                      <button onClick={() => handleViewApplicants(job.id, job.title)} className="job-btn view-btn">View</button>
                      <button onClick={() => handleEditClick(job)} className="job-btn edit-btn">Edit</button>
                      <button onClick={() => handleDelete(job.id)} className="job-btn delete-btn">Delete</button>
                    </footer>
                  </article>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="create-job-section" ref={formSectionRef}>
  <header>
    <h1>
      {viewingApplicantsJobId 
        ? `Applicants for "${selectedJobTitle}"`
        : (editingJobId ? 'Edit Your Job' : 'Post a New Job')
      }
    </h1>
  </header>

  {error && <p className="error-msg" role="alert">{error}</p>}

  {viewingApplicantsJobId ? (
    <>
      {applicants.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <ul className="applicants-list">
          {applicants.map(applicant => (
            <li key={applicant.id} className="applicant-card">
             <p><strong>Full Name:</strong> {applicant.name} {applicant.surname}</p>
             <p><strong>Skill:</strong> {applicant.skills}</p>
             <p><strong>Motivation:</strong> {applicant.motivation}</p>
             <p><strong>Email:</strong> {applicant.email}</p>
              <button onClick={() => handleAcceptApplicant(applicant.id)} className="accept-btn">Accept</button>
              <button onClick={() => handleRejectApplicant(applicant.id)} className="reject-btn">Reject</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => setViewingApplicantsJobId(null)} className="cancel-btn">Back to Job Form</button>
    </>
  ) : (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>{editingJobId ? 'Update Job Details' : 'Job Details'}</legend>

        <label htmlFor="title">Job Title</label>
        <input id="title" type="text" name="title" value={formData.title} onChange={handleChange} required />

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />

        <label htmlFor="category">Category</label>
        <select id="category" name="category" value={formData.category} onChange={handleChange} required>
          <option value="" disabled>Select a category...</option>
          <option value="Web Development">Web Development</option>
          <option value="Design">Design</option>
          <option value="Writing">Writing</option>
          <option value="Marketing">Marketing</option>
          <option value="Admin Support">Admin Support</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="budget">Budget (USD)</label>
        <input id="budget" type="number" name="budget" value={formData.budget} onChange={handleChange} required min="0" step="any" />

        <label htmlFor="deadline">Deadline</label>
        <input id="deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
      </fieldset>
      <fieldset>
  <legend>Milestone Payments (Optional)</legend>

  {formData.milestones?.map((milestone, index) => (
    <div className="milestone-group" key={index}>
      <label htmlFor={`milestone-description-${index}`}>Milestone {index + 1} Description</label>
      <input
        id={`milestone-description-${index}`}
        type="text"
        value={milestone.description}
        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
        placeholder={`Describe milestone ${index + 1}`}
      />

      <label htmlFor={`milestone-amount-${index}`}>Milestone {index + 1} Amount (USD)</label>
      <input
        id={`milestone-amount-${index}`}
        type="number"
        value={milestone.amount}
        onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
        min="0"
        step="any"
        placeholder="Amount"
      />
    </div>
  ))}
</fieldset>


      <footer>
        <button type="submit">{editingJobId ? 'Save Changes' : 'Create Job'}</button>
        {editingJobId && (
          <button type="button" onClick={handleCancelEdit} className="cancel-btn">Cancel Edit</button>
        )}
      </footer>
    </form>
  )}
</section>

      </main>

      <FooterClient />
    </>
  );
};

export default ClientJobs;