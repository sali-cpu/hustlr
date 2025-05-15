import React, { useState } from 'react';
import '../stylesheets/AboutSC.css';
import HeaderFreelancer from "../components/HeaderFreelancer";
import FooterClient from "../components/FooterClient";

import icon1 from '../images/s1.png';
import icon2 from '../images/s2.png';
import icon3 from '../images/s3.png';
import icon4 from '../images/s4.png';
import icon5 from '../images/s6.png';

const profileIcons = [icon1, icon2, icon3, icon4, icon5];

const AboutSC = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    bio: '',
    profession: '',
    totalJobs: '',
    selectedIcon: icon1
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e) => {
    if (isSaved) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectIcon = (icon) => {
    if (isSaved) return;
    setFormData(prev => ({ ...prev, selectedIcon: icon }));
  };

  const handleSave = () => {
    setIsSaved(true);
  };

  return (
    <>
      <HeaderFreelancer />

      <section className="settings-container">
        <h2 className="centered-title">Account Settings</h2>
        <h3 className="hName">Welcome (Name) (Surname)</h3>

        {isSaved && (
          <section className="top-icon-container">
            <img src={formData.selectedIcon} alt="Selected Icon" className="top-profile-icon" />
          </section>
        )}

        <form className="settings-form">
          <label>
            Skills:
            <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={isSaved} />
          </label>


          <label>
            Bio:
            <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} disabled={isSaved} />
          </label>

          <label>
            Profession:
            <input type="text" name="profession" value={formData.profession} onChange={handleChange} disabled={isSaved} />
          </label>

          <label>
            Total Jobs Done:
            <input type="number" name="totalJobs" value={formData.totalJobs} onChange={handleChange} disabled={isSaved} />
          </label>

          {!isSaved && (
            <section className="icon-selection">
              <p>Select Profile Icon:</p>
              <section className="icon-grid">
                {profileIcons.map((icon, index) => (
                  <img
                    key={index}
                    src={icon}
                    alt={`icon-${index}`}
                    className={`icon-option ${formData.selectedIcon === icon ? 'selected' : ''}`}
                    onClick={() => selectIcon(icon)}
                  />
                ))}
              </section>
            </section>
          )}

          {!isSaved && (
            <button type="button" className="save-btn" onClick={handleSave}>
              Save Settings
            </button>
          )}
        </form>
      </section>

      <FooterClient />
    </>
  );
};

export default AboutSC;
