import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { applications_db } from '../firebaseConfig';
import HeaderClient from '../components/HeaderClient';
import FooterClient from '../components/FooterClient';
import '../stylesheets/ClientReports.css';


const ClientReports = () => {

   const [setActiveJobs] = useState([]);
  const [ setPreviousJobs] = useState([]);

useEffect(() => {
  const unsub = onValue(ref(applications_db, 'accepted_applications'), snapshot => {
    if (!snapshot.exists()) return;

    const applications = snapshot.val();
    const currentUID = localStorage.getItem("userUID");

    const active = [];
    const previous = [];

    Object.values(applications).forEach(jobGroup => {
      Object.entries(jobGroup).forEach(([appId, appData]) => {
        if (appData.applicant_userUID !== currentUID) return;

        const milestones = appData.job_milestones || {};
        const milestoneList = Object.values(milestones);

        const hasActiveMilestone = milestoneList.some(m => 
          {
          let status;
          if (m.status != null) {
              status = m.status.toLowerCase();
          } 
          else 
          {
              status = undefined;
            }
          return status === "pending" || status === "in-progress";
        });

        const job = {
          title: appData.jobTitle,
          description: appData.motivation,
          partnerName: `${appData.name} ${appData.surname}`,
          deadline: appData.deadline || "N/A",
          milestones: milestoneList.map(m => ({
            description: m.description,
            amount: m.amount,
            status: m.status,
          })),
          budget: milestoneList.reduce((sum, m) => sum + Number(m.amount || 0), 0),
        };

        if (hasActiveMilestone) {
          active.push(job);
        } else {
          previous.push(job);
        }
      });
    });

    setActiveJobs(active);
    setPreviousJobs(previous);
  });

  return () => unsub(); 
}, []);


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
        const response = await fetch(`/api/reports?report_type=${formData.report_type}&start_date=${formData.start_date}&end_date=${formData.end_date}`);
        if (!response.ok) throw new Error('Failed to fetch report data');
        const raw = await response.json();
       if (formData.report_type === 'financial') 
        {
          data = raw.financial_summary;
        } 
        else if (formData.report_type === 'jobs') 
          { 
          data = raw.jobs_analysis;
          } 
          else 
          {  
          data = raw.freelancer_performance;
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
            {cat.name}:  (${cat.amount?.toLocaleString()})
          </li>
        ))}
      </ul>
      <table>
        <caption>Monthly Trends</caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Total</th>
            
          </tr>
        </thead>
        <tbody>
          {reportData?.monthly_trends?.map(m => (
            <tr key={m.month}>
              <td>{m.month}</td>
              <td>${m.total.toLocaleString()}</td>
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
            {stat.status.replace('_', ' ')}: {stat.count} 
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
          
          <nav className="main-nav">
            <ul>
              <li><a href="/Client">Home</a></li> 
            </ul>
          </nav>

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
            </>
          )}
        </section>
      </main>
      <FooterClient />
    </>
  );
};

export default ClientReports;
