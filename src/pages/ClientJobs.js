import React, { useState, useEffect, useRef } from 'react';
import '../stylesheets/ClientJobs.css';

// Mock Data (replace with actual data fetching)
const initialJobs = [
  { id: 1, title: 'Build Responsive Website', category: 'Web Development', budget: 1500, deadline: '2025-05-15', description: 'Need a modern, responsive website for a small business.' },
  { id: 2, title: 'Company Logo Design', category: 'Design', budget: 500, deadline: '2025-04-30', description: 'Create a unique and memorable logo.' },
  { id: 3, title: 'Blog Post Articles', category: 'Writing', budget: 800, deadline: '2025-05-10', description: 'Write 5 engaging blog posts about digital marketing.' },
];

// Initial state for the form
const initialFormData = {
  title: '',
  description: '',
  category: '',
  budget: '',
  deadline: '',
};

const ClientJobs = () => {
  const [jobs, setJobs] = useState(initialJobs);
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [editingJobId, setEditingJobId] = useState(null); // null = creating, ID = editing

  const formSectionRef = useRef(null); // Ref for scrolling form into view

  // --- Form Input Change Handler ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Handle clicking the Edit button ---
  const handleEditClick = (jobToEdit) => {
    setEditingJobId(jobToEdit.id);
    // Ensure date is in YYYY-MM-DD format for the input[type=date]
    const formattedJob = {
        ...jobToEdit,
        deadline: jobToEdit.deadline ? jobToEdit.deadline.split('T')[0] : '' // Handle potential ISO strings
    };
    setFormData(formattedJob);
    setError(''); // Clear any previous errors
    // Scroll the form into view smoothly
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // --- Handle clicking the Delete button ---
  const handleDelete = (jobIdToDelete) => {
    // Optional: Confirmation prompt
    if (!window.confirm('Are you sure you want to delete this job?')) {
        return;
    }

    // --- Real App: Add API call here (DELETE /api/jobs/:jobIdToDelete) ---

    // Update state after confirmation (and successful API call in real app)
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobIdToDelete));

    // If the job being deleted is the one currently in the edit form, reset the form
    if (editingJobId === jobIdToDelete) {
      handleCancelEdit(); // Reuse cancel logic
    }
    console.log('Job deleted (simulated):', jobIdToDelete);
    // --- End API call simulation ---
  };

  // --- Handle cancelling an edit ---
  const handleCancelEdit = () => {
    setEditingJobId(null);
    setFormData(initialFormData); // Reset to empty form
    setError('');
  };

  // --- Handle form submission (Create or Update) ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.budget || !formData.deadline) {
      setError('Please fill in all fields.');
      return;
    }
    setError(''); // Clear error on successful validation

    if (editingJobId !== null) {
      // --- UPDATE existing job ---
      // --- Real App: Add API call here (PUT/PATCH /api/jobs/:editingJobId with formData) ---
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === editingJobId
            ? { ...formData, id: editingJobId, budget: parseFloat(formData.budget) } // Update the matching job
            : job // Keep other jobs the same
        )
      );
      console.log('Job updated (simulated):', editingJobId, formData);
      handleCancelEdit(); // Reset form and editing state after update
      // --- End API call simulation ---

    } else {
      // --- CREATE new job ---
      // --- Real App: Add API call here (POST /api/jobs with formData) ---
      const newJob = {
        id: Date.now(), // Use timestamp as a simple unique ID for demo
        ...formData,
        budget: parseFloat(formData.budget) // Ensure budget is a number
      };
      // Add new job to the beginning of the list
      setJobs(prevJobs => [newJob, ...prevJobs]);
      console.log('New Job submitted:', newJob);
      setFormData(initialFormData); // Reset form only after creation
      // --- End API call simulation ---
    }
  };

  // --- Component Render ---
  return (
    <>
      {/* --- Header Section --- */}
      <header className="client-jobs-header">
       
          {/* Title Area using section for structure */}
          <section className="header-title-area">
            <h1 className="main-title">Jobs for Clients</h1>
          </section> {/* End header-title-area section */}
           {/* Top Bar using section for structure */}
        <section className="nav_section">
          {/* Main Navigation */}
          <nav className="main-nav">
            <ul>
              <li><a href="/client">Home</a></li>
              {/* Add 'active' class dynamically based on current page */}
              <li><a href="/ClientPayments" className="active">Payments</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </nav>

          
        </section> {/* End header-top-bar section */}

        
      </header>

      {/* --- Main Content --- */}
      <main className="client-jobs-container">

        {/* Posted Jobs List Section */}
        <section className="posted-jobs-section">
          <h2>Your Posted Jobs</h2>
          {/* Jobs List using UL */}
          <ul className="jobs-list">
            {jobs.length === 0 ? (
              <li className="no-jobs-message"><p>You haven't posted any jobs yet.</p></li>
            ) : (
              jobs.map(job => (
                // Each Job as LI > Article
                <li key={job.id}>
                  <article className="job-card">
                    {/* Optional header within the article */}
                    <header className="job-card-header">
                      <h3>{job.title}</h3>
                      <p><strong>Category:</strong> {job.category}</p>
                    </header>
                    {/* Job Details */}
                    <p><strong>Budget:</strong> ${job.budget ? job.budget.toLocaleString() : 'N/A'}</p>
                    <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline + 'T00:00:00').toLocaleDateString() : 'N/A'}</p>
                    <p className="job-description"><strong>Description:</strong> {job.description}</p>
                    {/* Actions Footer within the article */}
                    <footer className="job-actions">
                      <button
                        onClick={() => handleEditClick(job)}
                        className="job-btn edit-btn"
                        aria-label={`Edit job: ${job.title}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="job-btn delete-btn"
                        aria-label={`Delete job: ${job.title}`}
                      >
                        Delete
                      </button>
                    </footer>
                  </article>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Create/Edit Job Form Section */}
        <section className="create-job-section" ref={formSectionRef}>
          <header>
            <h1>{editingJobId ? 'Edit Your Job' : 'Post a New Job'}</h1>
          </header>

          {/* Error Message Display */}
          {error && <p className="error-msg" role="alert">{error}</p>}

          {/* Form Element */}
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>{editingJobId ? 'Update Job Details' : 'Job Details'}</legend>

              {/* Form Fields */}
              <label htmlFor="title">Job Title</label>
              <input id="title" type="text" name="title" value={formData.title} onChange={handleChange} required aria-required="true"/>

              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} required aria-required="true"/>

              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required aria-required="true">
                <option value="" disabled>Select a category...</option>
                <option value="Web Development">Web Development</option>
                <option value="Design">Design</option>
                <option value="Writing">Writing</option>
                <option value="Marketing">Marketing</option>
                <option value="Admin Support">Admin Support</option>
                <option value="Other">Other</option>
              </select>

              <label htmlFor="budget">Budget (USD)</label>
              <input id="budget" type="number" name="budget" value={formData.budget} onChange={handleChange} required aria-required="true" min="0" step="any"/>

              <label htmlFor="deadline">Deadline</label>
              <input id="deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} required aria-required="true"/>
            </fieldset>

            {/* Form Footer with Buttons */}
            <footer>
              <button type="submit">
                {editingJobId ? 'Save Changes' : 'Create Job'}
              </button>
              {/* Conditional Cancel Button */}
              {editingJobId && (
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel Edit
                </button>
              )}
            </footer>
          </form>
        </section>
      </main>
    </>
  );
};

export default ClientJobs;