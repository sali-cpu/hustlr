import React from 'react';
import '../stylesheets/CQStats.css';
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";

const CQStats = () => {
  // Mock data - in a real app, this would come from props/API
  const stats = {
    jobsPosted: 8,
    activeJobs: 2,
    completedJobs: 6,
    totalSpent: 12000,
    completionRate: 75, // percentage
    earningsOverTime: [2000, 4000, 7000, 9000, 12000] // sample data for the chart
  };

  return (

    <>
    <HeaderClient />

    <main className="cqstats-main">
      <header className="cqstats-header">
        <section className="header-title-area">
          <h1 className="main-title">Client Reports</h1>
        </section>

        <nav className="main-nav" aria-label="Primary navigation">
          <ul>
            <li><a href="/client">Home</a></li>
          </ul>
        </nav>
      </header>

      <section aria-label="Client statistics" className="stats-section">
        <article aria-labelledby="jobs-posted-heading">
          <h2 id="jobs-posted-heading">Jobs Posted</h2>
          <p>{stats.jobsPosted}</p>
          <meter 
            min="0" 
            max="10" 
            value={stats.jobsPosted}
            aria-label={`${stats.jobsPosted} out of 10 jobs posted`}
          ></meter>
        </article>

        <article aria-labelledby="active-jobs-heading">
          <h2 id="active-jobs-heading">Active Jobs</h2>
          <p>{stats.activeJobs}</p>
          <progress 
            max={stats.jobsPosted} 
            value={stats.activeJobs}
            aria-label={`${stats.activeJobs} active jobs out of ${stats.jobsPosted} total`}
          ></progress>
        </article>

        <article aria-labelledby="completed-jobs-heading">
          <h2 id="completed-jobs-heading">Completed Jobs</h2>
          <p>{stats.completedJobs}</p>
          <progress 
            max={stats.jobsPosted} 
            value={stats.completedJobs}
            aria-label={`${stats.completedJobs} jobs completed out of ${stats.jobsPosted} total`}
          ></progress>
        </article>

        <article aria-labelledby="total-spent-heading">
          <h2 id="total-spent-heading">Total Spent</h2>
          <p>${stats.totalSpent.toLocaleString()}</p>
        </article>

        <article aria-labelledby="completion-rate-heading">
          <h2 id="completion-rate-heading">Completion Rate</h2>
          <p>{stats.completionRate}%</p>
          <svg 
            viewBox="0 0 36 36" 
            className="circular-chart"
            aria-labelledby="completion-rate-heading completion-rate-desc"
            role="img"
          >
            <title id="completion-rate-desc">A circular chart showing {stats.completionRate}% completion rate</title>
            <path
              className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle-fill"
              strokeDasharray={`${stats.completionRate}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.5" className="percentage">{stats.completionRate}%</text>
          </svg>
        </article>

        <article aria-labelledby="earnings-trend-heading">
          <h2 id="earnings-trend-heading">Payments Trend</h2>
          <figure>
            <svg 
              viewBox="0 0 100 40" 
              className="line-chart"
              aria-labelledby="earnings-trend-heading earnings-trend-desc"
              role="img"
            >
              <title id="earnings-trend-desc">Line chart showing earnings growth over time</title>
              <polyline
                fill="none"
                stroke="#007bff"
                strokeWidth="2"
                points={stats.earningsOverTime.map((value, i) => {
                  const x = (i * 100) / (stats.earningsOverTime.length - 1);
                  const y = 40 - (value / Math.max(...stats.earningsOverTime)) * 35;
                  return `${x},${y}`;
                }).join(' ')}
              />
            </svg>
            <figcaption className="visually-hidden">Earnings growth over {stats.earningsOverTime.length} periods</figcaption>
          </figure>
        </article>
      </section>
    </main>
    <FooterClient />
    </>
  );
};

export default CQStats;