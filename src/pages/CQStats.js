import React from 'react';
import '../stylesheets/CQStats.css';

const CQStats = () => {
  const stats = {
    jobsPosted: 8,
    activeJobs: 2,
    completedJobs: 6,
    totalSpent: 12000,
  };

  return (
    <main>

      <header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Client Quick Stats</h1>
        </section>

        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/client">Home</a></li>
            </ul>
          </nav>
        </section>
      
        
      </header>

      <section aria-label="Client statistics" className="stats-section">
        <article>
          <h2>Jobs Posted</h2>
          <p>{stats.jobsPosted}</p>
        </article>

        <article>
          <h2>Active Jobs</h2>
          <p>{stats.activeJobs}</p>
        </article>

        <article>
          <h2>Completed Jobs</h2>
          <p>{stats.completedJobs}</p>
        </article>

        <article>
          <h2>Total Spent</h2>
          <p>${stats.totalSpent.toLocaleString()}</p>
        </article>
      </section>
    </main>
  );
};

export default CQStats;
