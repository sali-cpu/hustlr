import React, { useState } from 'react';
import '../stylesheets/FreelancerJob.css';
import HeaderFreelancer from '../components/HeaderFreelancer'; // Make sure this is the right path

const jobData = [
  {
    id: 1,
    title: 'Website Redesign',
    client: 'Acme Corp',
    category: 'Web Design',
    budget: '$300',
    datePosted: '2025-04-19',
  },
  {
    id: 2,
    title: 'Mobile App Development',
    client: 'StartUp Inc',
    category: 'App Development',
    budget: '$1200',
    datePosted: '2025-04-15',
  },
  // Add more jobs here
];

const FreelancerJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredJobs = jobData.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || job.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <HeaderFreelancer />

      {/* --- Header Section --- */}
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
          </select>
        </aside>

        <section className="job-listings">
          <h2>Available Jobs</h2>
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p><strong>Client:</strong> {job.client}</p>
                <p><strong>Category:</strong> {job.category}</p>
                <p><strong>Budget:</strong> {job.budget}</p>
                <p><strong>Posted on:</strong> {job.datePosted}</p>
                <button>Apply</button>
              </div>
            ))
          ) : (
            <p>No jobs found.</p>
          )}
        </section>
      </main>
    </>
  );
};

export default FreelancerJobs;
