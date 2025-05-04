
import Header from "./components/Header";
import Footer from "./components/Footer";
import Land from "./pages/Land";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from './pages/SignIn'
import Client from "./pages/Client";
import Freelancers from "./pages/Freelancer";
import AdminCorrect from "./pages/AdminCorrect";
import ClientJobs from "./pages/ClientJobs"; 
import ClientPayments from "./pages/ClientPayments";
import FreelancerJobs from "./pages/FreelancerJobs";
import AdminJobs from "./pages/AdminJobs";
import RecentActivity from './pages/RecentActivity';
import RouteTracker from './components/RouteTracker'; // Import RouteTracker
import FreelancerPayments from "./pages/FreelancerPayments";
import CQStats from "./pages/CQStats";


import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css';

function App() {
  return (
    <Router>
       <RouteTracker /> 
      <section className="App">
        <Routes>
          
        <Route
            path="/"
            element={
              <>
                <Header/>
                <Home />
                <Footer/>
              </>
            }
          />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/Land" element={<Land />} />
          <Route path="/Client" element={<Client />} />
          <Route path="/Freelancer" element={<Freelancers />} />
          <Route path="/Admin" element={<AdminCorrect />} />
          <Route path="/ClientJobs" element={<ClientJobs />} />
          <Route path="/ClientPayments" element={<ClientPayments />} />
          <Route path="/FreelancerJobs" element={<FreelancerJobs />} />
          <Route path="/AdminJobs" element={<AdminJobs />} />
          <Route path="/FreelancerPayments" element={<FreelancerPayments />} />
          <Route path="/RecentActivity" element={<RecentActivity />} />
          <Route path="/CQStats" element={<CQStats />} />

        </Routes>
      </section>
      
    </Router>
  );

}

export default App;
