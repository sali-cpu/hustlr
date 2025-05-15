import React, { useState } from "react";
import '../stylesheets/FreeReports.css';
import HeaderClient from '../components/HeaderClient';
import FooterClient from '../components/FooterClient';

const FreeReports = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    skill: "",
    region: "",
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await fetchFreelancerReportData(filters);
    setReportData(data);
    setLoading(false);
  };
  const USE_MOCK = true;

  async function fetchFreelancerReportData(filters) {
    if (!USE_MOCK) {
      try {
        // Adjust this to your real backend API endpoint
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`/api/freelancer/stats?${query}`);
        if (!res.ok) throw new Error("Failed to fetch");
        return await res.json();
      } catch (err) {
        console.error("Backend fetch failed:", err);
        return null;
      }
    }
  
    // Mock response — you can extend it with filters if you want
    return {
      total: 120,
      active: 85,
      topSkill: "Development",
      earningsData: [
        { month: "Jan", amount: 1200 },
        { month: "Feb", amount: 1500 },
        { month: "Mar", amount: 1000 },
        { month: "Apr", amount: 1700 },
      ],
      skillDistribution: {
        design: 30,
        development: 60,
        writing: 30,
      },
      retentionRate: 92,
    };
  }
  
  return (
    <>
      <HeaderClient />
    <main className="reports-main">
      <header className="reports-header">
        <h1>Freelancer Reports</h1>
        <p>Analyze freelancer performance, regions, skills, and more</p>
      </header>

      <section className="report-filters">
        <h2>Filter Freelancers</h2>
        <form id="report-query-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Date Range</legend>
            <label htmlFor="startDate">Start Date</label>
            <input type="date" name="startDate" onChange={handleChange} />
            <label htmlFor="endDate">End Date</label>
            <input type="date" name="endDate" onChange={handleChange} />
          </fieldset>

          <fieldset>
            <legend>Freelancer Skill</legend>
            <label htmlFor="skill">Skill</label>
            <select name="skill" onChange={handleChange}>
              <option value="">All</option>
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="writing">Writing</option>
            </select>
          </fieldset>

          <fieldset>
            <legend>Region</legend>
            <label htmlFor="region">Region</label>
            <select name="region" onChange={handleChange}>
              <option value="">All</option>
              <option value="africa">Africa</option>
              <option value="europe">Europe</option>
              <option value="asia">Asia</option>
            </select>
          </fieldset>

          <button type="submit">Generate Report</button>
        </form>
      </section>

      {loading && (
        <section aria-live="polite">
          <p>Loading freelancer report...</p>
        </section>
      )}

      {reportData && (
        <>
          <section className="data-specification">
            <h2>Freelancer Summary</h2>
            <dl>
              <dt>Total Clients</dt>
              <dd>{reportData.total}</dd>
              <dt>Active Clients</dt>
              <dd>{reportData.active}</dd>
              <dt>Top Skill</dt>
              <dd>{reportData.topSkill}</dd>
            </dl>
          </section>

          <section className="report-output">
            <h2>Performance Insights</h2>

            <article aria-labelledby="earnings-heading">
              <h3 id="earnings-heading">Earnings Overview</h3>
              <section className="financial-charts">
                <p>[Earnings Chart]</p>
              </section>
            </article>

            <article aria-labelledby="skills-heading">
              <h3 id="skills-heading">Skill Distribution</h3>
              <section className="freelancer-charts">
                <p>[Skills Pie Chart]</p>
              </section>
            </article>

            <article aria-labelledby="retention-heading">
              <h3 id="retention-heading">Freelancer Retention</h3>
              <section className="jobs-charts">
                <p>[Retention Line Chart]</p>
              </section>
            </article>
          </section>
        </>
      )}
    </main>
    <FooterClient />
    </>
  );
};

export default FreeReports;