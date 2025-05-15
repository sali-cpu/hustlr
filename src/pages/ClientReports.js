import React, { useState } from 'react';
import HeaderClient from '../components/HeaderClient';
import FooterClient from '../components/FooterClient';
import '../stylesheets/ClientReports.css';

// Mock data (already structured correctly)
const MOCK_DATA = {
  financial_summary: {
    total_spent: 18500,
    currency: "USD",
    by_category: [
      { name: "Web Development", amount: 8500, percentage: 46 },
      { name: "Graphic Design", amount: 4200, percentage: 23 },
      { name: "Content Writing", amount: 3800, percentage: 20 },
      { name: "SEO", amount: 2000, percentage: 11 }
    ],
    monthly_trends: [
      { month: "2025-01", total: 4200, change: "+5%" },
      { month: "2025-02", total: 5100, change: "+21%" },
      { month: "2025-03", total: 4800, change: "-6%" },
      { month: "2025-04", total: 4400, change: "-8%" }
    ]
  },
  jobs_analysis: {
    by_status: [
      { status: "completed", count: 12, percentage: 75 },
      { status: "in_progress", count: 3, percentage: 19 },
      { status: "pending", count: 1, percentage: 6 }
    ],
    completion_timelines: [
      { job_id: 101, duration_days: 14, on_time: true },
      { job_id: 102, duration_days: 21, on_time: false },
      { job_id: 103, duration_days: 7, on_time: true }
    ],
    freelancer_ratings: [
      { job_id: 101, rating: 4.8, feedback: "Excellent communication" },
      { job_id: 102, rating: 3.5, feedback: "Missed some deadlines" },
      { job_id: 103, rating: 5.0, feedback: "Perfect delivery" }
    ]
  },
  freelancer_performance: {
    completion_rates: [
      { freelancer_id: 1, name: "Sarah Johnson", completed: 8, total: 8, rate: 100 },
      { freelancer_id: 2, name: "Mike Chen", completed: 5, total: 6, rate: 83 },
      { freelancer_id: 3, name: "Emma Wilson", completed: 3, total: 3, rate: 100 }
    ],
    average_ratings: [
      { freelancer_id: 1, name: "Sarah Johnson", avg_rating: 4.9, count: 8 },
      { freelancer_id: 2, name: "Mike Chen", avg_rating: 4.2, count: 5 },
      { freelancer_id: 3, name: "Emma Wilson", avg_rating: 4.7, count: 3 }
    ],
    delivery_stats: [
      { freelancer_id: 1, on_time: 8, late: 0, percentage: 100 },
      { freelancer_id: 2, on_time: 4, late: 1, percentage: 80 },
      { freelancer_id: 3, on_time: 3, late: 0, percentage: 100 }
    ]
  }
};

const ClientReports = () => {
  const [formData, setFormData] = useState({
    start_date: '2025-01-01',
    end_date: '2025-04-30',
    report_type: 'financial'
  });

  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let data;

      if (useMockData) {
        data = formData.report_type === 'financial' ? MOCK_DATA.financial_summary :
               formData.report_type === 'jobs' ? MOCK_DATA.jobs_analysis :
               MOCK_DATA.freelancer_performance;

        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        const response = await fetch(`/api/reports?report_type=${formData.report_type}&start_date=${formData.start_date}&end_date=${formData.end_date}`);
        if (!response.ok) throw new Error('Failed to fetch report data');
        const raw = await response.json();
        data = formData.report_type === 'financial' ? raw.financial_summary :
               formData.report_type === 'jobs' ? raw.jobs_analysis :
               raw.freelancer_performance;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFinancialReport = () => (
    <section className="report-section">
      <h4>Total Spent: {reportData?.currency} {reportData?.total_spent?.toLocaleString()}</h4>
      <ul>
        {reportData?.by_category?.map(cat => (
          <li key={cat.name}>
            {cat.name}: {cat.percentage}% (${cat.amount?.toLocaleString()})
          </li>
        ))}
      </ul>
      <table>
        <caption>Monthly Trends</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Total</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {reportData?.monthly_trends?.map(m => (
            <tr key={m.month}>
              <td>{m.month}</td>
              <td>${m.total.toLocaleString()}</td>
              <td>{m.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  const renderJobsReport = () => (
    <section className="report-section">
      <ul>
        {reportData?.by_status?.map(stat => (
          <li key={stat.status}>
            {stat.status.replace('_', ' ')}: {stat.count} ({stat.percentage}%)
          </li>
        ))}
      </ul>
      <table>
        <caption>Completion Timelines</caption>
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Duration (days)</th>
            <th>On Time</th>
          </tr>
        </thead>
        <tbody>
          {reportData?.completion_timelines?.map(job => (
            <tr key={job.job_id}>
              <td>{job.job_id}</td>
              <td>{job.duration_days}</td>
              <td>{job.on_time ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  const renderFreelancerReport = () => (
    <section className="report-section">
      <ul>
        {reportData?.completion_rates?.map(f => (
          <li key={f.freelancer_id}>
            {f.name}: {f.rate}% completion
          </li>
        ))}
      </ul>
      <table>
        <caption>Freelancer Stats</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Avg Rating</th>
            <th>On Time %</th>
          </tr>
        </thead>
        <tbody>
          {reportData?.completion_rates?.map((f, idx) => (
            <tr key={f.freelancer_id}>
              <td>{f.name}</td>
              <td>{reportData?.average_ratings?.[idx]?.avg_rating?.toFixed(1)}</td>
              <td>{reportData?.delivery_stats?.[idx]?.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  return (
    <>
      <HeaderClient />
      <main className="reports-main">
        <header className="reports-header">
          <h1>Client Performance Reports</h1>
          <p>Detailed analytics and historical performance data</p>

          <section className="dev-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={useMockData}
                onChange={() => setUseMockData(!useMockData)}
              />
              Use Mock Data
            </label>
          </section>
        </header>

        <form className="report-form" onSubmit={handleSubmit}>
          <label>
            Start Date:
            <input type="date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
          </label>
          <label>
            End Date:
            <input type="date" name="end_date" value={formData.end_date} onChange={handleInputChange} />
          </label>
          <label>
            Report Type:
            <select name="report_type" value={formData.report_type} onChange={handleInputChange}>
              <option value="financial">Financial</option>
              <option value="jobs">Jobs</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>

        <section className="report-results">
          {isLoading && <p>Loading report...</p>}
          {!isLoading && reportData && (
            <>
              {formData.report_type === 'financial' && renderFinancialReport()}
              {formData.report_type === 'jobs' && renderJobsReport()}
              {formData.report_type === 'freelancer' && renderFreelancerReport()}
            </>
          )}
        </section>
      </main>
      <FooterClient />
    </>
  );
};

export default ClientReports;
