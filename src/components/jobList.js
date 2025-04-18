import React from 'react';

const JobList = ({ jobs }) => {
  if (jobs.length === 0) return <p>No jobs yet.</p>;

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2>Job Preview</h2>
      {jobs.map((job, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#f9f9f9'
          }}
        >
          <h3>{job.title}</h3>
          <p><strong>Description:</strong> {job.description}</p>
          <p><strong>Category:</strong> {job.category}</p>
          <p><strong>Budget:</strong> ${job.budget}</p>
          <p><strong>Deadline:</strong> {job.deadline}</p>
        </div>
      ))}
    </section>
  );
};

export default JobList;
