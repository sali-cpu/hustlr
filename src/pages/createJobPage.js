
import React, { useState } from 'react';
import JobForm from '../components/jobForm';
import { useNavigate } from 'react-router-dom';

const CreateJobPage = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  const handleAddJob = (job) => {
    setJobs((prevJobs) => [...prevJobs, job]);
    // After job is added, redirect to Client dashboard
    navigate('/Client');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Create a New Job</h1>
      <JobForm onAddJob={handleAddJob} />
    </div>
  );
};

export default CreateJobPage;
