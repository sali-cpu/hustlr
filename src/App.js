
import Header from "./components/Header";
import Footer from "./components/Footer";
import Land from "./pages/Land";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Client from "./pages/Client";
import Freelancers from "./pages/Freelancer";
import AdminCorrect from "./pages/AdminCorrect";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css';

function App() {
  return (
    <Router>
      
      <section className="App">
        <Routes>
          
        <Route
            path="/"
            element={
              <>
                <Header/>
                <Index />
                <Footer/>
              </>
            }
          />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/Land" element={<Land />} />
          <Route path="/Client" element={<Client />} />
          <Route path="/Freelancer" element={<Freelancers />} />
          <Route path="/Admin" element={<AdminCorrect />} />
        </Routes>
      </section>
      
    </Router>
  );

}

export default App;
