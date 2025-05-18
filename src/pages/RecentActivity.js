// pages/RecentActivity.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../stylesheets/RecentActivity.css';
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";

const STORAGE_KEY = 'recent_activity';

const pathLabels = {
  '/': 'Home',
  '/SignIn': 'Sign In',
  '/SignUp': 'Sign Up',
  '/Land': 'Landing Page',
  '/Client': 'Client Dashboard',
   '/client': 'Client Dashboard',
  '/Freelancer': 'Freelancer Dashboard',
  '/Admin': 'Admin Panel',
  '/ClientJobs': 'Client Jobs',
  '/ClientPayments': 'Client Payments',
  '/FreelancerJobs': 'Freelancer Jobs',
  '/FreelancerPayments': 'Freelancer Payments',
  '/RecentActivity': 'Recent Activity',
  '/AdminJobs': 'Admin Jobs',
  '/CQStats': 'Stats',
  '/FQStats': 'Stats',
  '/FreeSettings': 'Settings',
  '/ClientSettings': 'Settings',
  '/AboutSC': 'About',
  '/AboutSF': 'About',
  '/ConTasksClients': 'Contracts & Tasks',
  '/ConTasksFreelancer': 'Contracts & Tasks',
  '/FreeOngoingJobs': 'Ongoing Jobs',
  '/ClientOngoingJobs': 'Ongoing Jobs',
};

const formatDate = isoString => {
  const date = new Date(isoString);
  return date.toLocaleString();
};

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActivities(JSON.parse(stored));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setActivities([]);
  };

  return (
    <>
      <HeaderClient />
    <section className="activity-container">
      <h2>🕒 Recent Activity</h2>
      <button onClick={clearHistory} className="clear-btn">Clear History</button>
      {activities.length > 0 ? (
        <ul className="activity-list">
          {activities.map((activity, index) => (
            <li
              key={index}
              className={`activity-item ${index === 0 ? 'latest' : ''}`}
            >
              <Link to={activity.path} className="activity-link">
                {index === 0 ? '🔸 ' : '• '}
                {pathLabels[activity.path] || activity.path}
              </Link>
              <section className="timestamp">{formatDate(activity.timestamp)}</section>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent activity found.</p>
      )}
    </section>
    <FooterClient />
    </>
  );
};

export default RecentActivity;
