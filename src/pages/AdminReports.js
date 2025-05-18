import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { applications_db } from '../firebaseConfig';
import HeaderAdmin from "../components/HeaderAdmin";

const AdminReports = () => {
 const [clients, setClients] = useState([]);         
  const [freelancers, setFreelancers] = useState([]); 
 
  
 useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(applications_db, 'Information');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) 
        {
          const usersData = snapshot.val();
          const clientsArray = [];
          const freelancersArray = [];
          
          Object.entries(usersData).forEach(([ user_UID,user]) => 
            {
                
             const userData = {
                name: user_UID.displayName,
                    bio: user.bio,
                    professtion : user.profession,
                    skills :user.skills,
                    totalJobs : user.totalJobs,
  };
            if (user.role === 'Client')
                {
                    clientsArray.push(userData);

                } 
            else if (user.role === 'Freelancer')
                {
                    freelancersArray.push(userData);

                } 
          });
          setClients(clientsArray);           
          setFreelancers(freelancersArray);    
        } 
        else 
        {
          alert('No users found.');
        }
      } 
      catch (error) 
      {
        alert('Error fetching users:',error.message);
      }
    };

    fetchUsers();
  }, []);


  return (
    <>
      <HeaderAdmin />
      <header className="client-jobs-header">
        <section className="header-title-area">
          <h1 className="main-title">Admin User Management</h1>
        </section>

        <section className="nav_section">
          <nav className="main-nav">
            <ul>
              <li><a href="/Admin">Home</a></li>
            </ul>
          </nav>
        </section>
      </header>

      <main className="admin-jobs-container">
        <section className="admin-user-section">
          <h2>Clients</h2>
          <section className="admin-job-list">
            {clients.length === 0 ? (
              <p className="no-jobs-message">No clients found.</p>
            ) : (
             clients.map((client, index) => (
                <section        className="admin-job-card" key={client.id}>
                        <p><strong>Client:</strong> {index}</p>
                        <h3>{client.professtion || 'Unknown Profession'}</h3>
                        <p><strong>Bio:</strong> {client.bio || 'N/A'}</p>
                        <p><strong>Total Jobs:</strong> {client.totalJobs || 0}</p>
                       
                </section>
))
            )}
          </section>
        </section>

        <section className="admin-user-section">
          <h2>Freelancers</h2>
          <section className="admin-job-list">
            {freelancers.length === 0 ? (
              <p className="no-jobs-message">No freelancers found.</p>
            ) : (
                        freelancers.map((freelancer, index) => (
                <section    className="admin-job-card" key={freelancer.id}>
                        <p><strong>Freelancer:</strong> {index}</p>
                        <h3>{freelancer.professtion || 'Unknown Profession'}</h3>
                        <p><strong>Bio:</strong> {freelancer.bio || 'N/A'}</p>
                        <p><strong>Skills:</strong> {freelancer.skills || 'N/A'}</p>
                        <p><strong>Total Jobs:</strong> {freelancer.totalJobs || 0}</p>
                        
                </section>
))
            )}
          </section>
        </section>
      </main>
    </>
  );
};

export default AdminReports;
