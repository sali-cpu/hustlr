import { useState, useEffect, useRef } from 'react';
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
    { description: '', amount: '', status: 'pending', duedate: ''},
    { description: '', amount: '', status: 'pending', duedate: ''},
    { description: '', amount: '', status: 'pending', duedate: ''}
  ] 
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


  const handleChange = (e) => 
    {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
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
       {description: '', amount: '', duedate: ''},
       {description: '', amount: '', duedate: ''},
       {description: '', amount: '', duedate: ''}
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
  
      if (snapshot.exists()) 
        {
        const data = snapshot.val();
        const loadedApplicants = Object.entries(data)
          .filter(([_, appData]) => {
            const status = appData.status?.toLowerCase();
            return status === 'pending' || status === 'accepted';
          })
          .map(([key, appData]) => ({
            id: key,
            user_UID: appData.applicant_userUID || '',
            name: appData.name || '',
            surname: appData.surname || '',
            motivation: appData.motivation || '',
            skills: appData.skills || '',
            status: appData.status || '',
            email: localStorage.getItem("userEmail"), 
           
          }));
  
        setApplicants(loadedApplicants);
      } 
      else 
      {
        setApplicants([]);
      }
        // This deals with scrolling down the page so dont remove
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  
    } 
    catch (error) 
    {
      alert("Failed to load applicants."+ error.message);
    }
  };
  
  
  
  const handleAcceptApplicant = async (applicantId) => {
    try 
    {
      const jobId = viewingApplicantsJobId;
      const applicantRef = ref(applications_db, `applications/${jobId}/${applicantId}`);
      const acceptedRef = ref(applications_db, `accepted_applications/${jobId}/${applicantId}`);
      const jobApplicationsRef = ref(applications_db, `applications/${jobId}`);
  
      // Fetch the accepted freelancer data
      const applicantSnapshot = await get(applicantRef);
      if (!applicantSnapshot.exists()) 
        {
        alert("Applicant not found.");
        return;
      }
      const applicantData = applicantSnapshot.val();
      const acceptedData = {
        ...applicantData,
        status: "accepted",
        milestones: applicantData.milestones || {}
      };
  
      
      await update(applicantRef, { status: "accepted" });
      await set(acceptedRef, acceptedData);
  
      // Reject all butt we might need to chamge this 
      const snapshot = await get(jobApplicationsRef);
      if (snapshot.exists()) 
        {
        const allApplicants = snapshot.val();

        for (const id in allApplicants) 
          {
            if (id !== applicantId) 
            {
              const otherRef = ref(applications_db, `applications/${jobId}/${id}`);
              await update(otherRef, 
                {
                status: "rejected"
                } 
              );
            }
        }
      }
  
      alert(`Accepted applicant with ID: ${applicantId}`);
      handleViewApplicants(jobId, selectedJobTitle); 
  
    } 
    catch (error) 
    {
      alert("Failed to accept applicant.");
    }
  };
  

  
  const handleRejectApplicant = async (applicantId) => 
    {
      const jobId = viewingApplicantsJobId;

  const applicationRef = ref(applications_db, `applications/${jobId}/${applicantId}`);
  const rejectedRef = ref(applications_db, `rejected_applications/${jobId}/${applicantId}`);

  try {
    // Get the current application data
    const snapshot = await get(applicationRef);
    if (!snapshot.exists()) {
      alert("Applicant not found.");
      return;
    }

    const applicantData = snapshot.val();
    await update(applicationRef, { status: "rejected" });

    const rejectedData = {
      ...applicantData,
      status: "rejected",
      rejectionTime: new Date().toISOString()
    };

    await set(rejectedRef, rejectedData);
    alert("Application rejected successfully.");
    handleViewApplicants(jobId, selectedJobTitle); 

  } 
  catch (error) 
  {
    alert("Failed to reject application: " + error.message);
  }
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
      setError('Please fill in all fields.');
      return;
    }

    for (const milestone of formData.milestones) 
      {
      if (!milestone.description || !milestone.amount || !milestone.duedate) 
        {
          setError('Please fill in all milestone fields.');
          return;
        }
    }
  
    setError('');

    try {
      if (editingJobId) 
        {
        const jobRef = ref(db, `jobs/${editingJobId}`);
        await update(jobRef, {
          ...formData,
          budget: parseFloat(formData.budget),
        });
      
      } 
      else 
      {
        const newJobRef = push(ref(db, "jobs"));
        await set(newJobRef, {
          ...formData,
          budget: parseFloat(formData.budget),
          clientUID: localStorage.getItem("userUID"),
        });
        //alert(" Job added to Firebase");
      }

      setFormData(initialFormData);
      setEditingJobId(null);

    } catch (error) {
      
      setError("Error: " + error.message);
      alert("Failed to add job: " + error.message);
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
  }, );

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
                    <strong>Description:</strong> {milestone.description} <br />
                    <strong>Amount:</strong> ${parseFloat(milestone.amount).toLocaleString()} <br />
                    <strong>Due Date:</strong> {milestone.duedate}
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

            {applicant.status.toLowerCase() === "accepted" ? (
              <section className="accepted-message" style={{ backgroundColor: '#d4edda', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                <strong>You have accepted this applicant for the job.</strong>
              </section>
            ) : (
              <section className="pending-message" style={{ marginTop: '10px' }}>
              <em>⏳ This application is still pending.</em>
              <button onClick={() => handleAcceptApplicant(applicant.id)} className="accept-btn">Accept</button>
              <button onClick={() => handleRejectApplicant(applicant.id)} className="reject-btn">Reject</button>
              </section>
            )}
             
             
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
  

  {formData.milestones.map((milestone, index) => (
  <section key={index} className="milestone-group">
    <label>
      Milestone {index + 1} Description:
      <input
        type="text"
        name={`milestone_description_${index}`}
        value={milestone.description}
        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
        required
      />
    </label>
    <label>
      Amount:
      <input
        type="number"
        name={`milestone_amount_${index}`}
        value={milestone.amount}
        onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
        required
      />
    </label>
    <label>
      Due Date:
      <input
        type="date"
        name={`milestone_duedate_${index}`}
        value={milestone.duedate}
        onChange={(e) => handleMilestoneChange(index, 'duedate', e.target.value)}
        required
      /> 
    </label>
    
  </section>
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
