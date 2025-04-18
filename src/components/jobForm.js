import React, { useState } from 'react';

const JobForm = ({ onAddJob }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { title, description, category, budget, deadline } = formData;

    if (!title || !description || !category || !budget || !deadline) {
      setError('Please fill in all fields.');
      return;
    }

    onAddJob({ ...formData });
    setFormData({ title: '', description: '', category: '', budget: '', deadline: '' });
    setError('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>Job Details</legend>

        <label>Job Title</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required></textarea>

        <label>Category</label>
        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Select...</option>
          <option value="Web Development">Web Development</option>
          <option value="Design">Design</option>
          <option value="Writing">Writing</option>
          <option value="Marketing">Marketing</option>
        </select>

        <label>Budget (USD)</label>
        <input type="number" name="budget" value={formData.budget} onChange={handleChange} required />

        <label>Deadline</label>
        <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required />
      </fieldset>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ textAlign: 'right', marginTop: '1rem' }}>
        <button type="submit">Create Job</button>
      </div>
    </form>
  );
};

export default JobForm;
