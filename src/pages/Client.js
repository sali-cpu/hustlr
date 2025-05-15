import React from "react";
import { Link } from "react-router-dom";
import cuteWelcome from '../images/cute.jpg';
import job from '../images/Job.png';
import pay from '../images/Payment.png';
import stat from '../images/Quick Stats.png';
import con from '../images/contract.png';
import rep from '../images/Reports.png';
import HeaderClient from "../components/HeaderClient";
import '../stylesheets/Final.css';

class Client extends React.Component {
  constructor(props) {
    super(props);
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    this.categories = [
      { 
        id: 1,
        name: "Jobs", 
        path: "/ClientJobs", 
        image: job,
        keywords: ["jobs", "work", "projects", "gigs"]
      },
      { 
        id: 2,
        name: "Contracts & Tasks", 
        path: "", 
        image: con,
        keywords: ["contracts", "tasks", "agreements"]
      },
      { 
        id: 3,
        name: "Payments", 
        path: "/ClientPayments", 
        image: pay,
        keywords: ["payments", "money", "transactions", "cash", "csv"]
      },
      { 
        id: 4,
        name: "Reports", 
        path: "/ClientReports", 
        image: rep,
        keywords: ["reports", "analytics", "statistics", ]
      },
      { 
        id: 5,
        name: "Quick Stats", 
        path: "/CQStats", 
        image: stat,
        keywords: ["stats", "performance", "metrics", "quick"]
      }
    ];

    this.state = {
      showWelcomeBox: !hasSeenWelcome,
      searchTerm: ""
    };
  }
  
  closeWelcomeMessage = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    this.setState({ showWelcomeBox: false });
  };

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value.toLowerCase() });
  };

  filterCategories = () => {
    const { searchTerm } = this.state;
    if (!searchTerm) return this.categories;

    return this.categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm) ||
      category.keywords.some(keyword => keyword.includes(searchTerm))
    );
  };

  render() {
    const filteredCategories = this.filterCategories();

    return (
      <>
        <HeaderClient />

        <section className="search-container">
          <section className="search-box">
            <input 
              type="text" 
              placeholder="Search for any service..." 
              onChange={this.handleSearchChange}
              value={this.state.searchTerm}
            />
            <button className="search-icon">🔍</button>
          </section>
        </section>

        <main className="client-main">
          {this.state.showWelcomeBox ? (
            <section className="messagebox">
              <button className="close" onClick={this.closeWelcomeMessage}>×</button>
              <img src={cuteWelcome} alt="Cute Welcome" />
              <h2>Welcome, Client!</h2>
              <p>
                We're excited to have you here! Our platform connects you with skilled freelancers
                ready to bring your projects to life.
              </p>
            </section>
          ) : (
            <section className="categories">
              {filteredCategories.length === 0 ? (
                <section className="no-results">
                  <p>No matching categories found</p>
                </section>
              ) : (
                <section className="category-grid">
                  {filteredCategories.map(category => (
                    category.path ? (
                      <Link to={category.path} key={category.id} className="category-link">
                        <section className="category-card">
                          <img src={category.image} alt={category.name} />
                          <p>{category.name}</p>
                        </section>
                      </Link>
                    ) : (
                      <section className="category-card" key={category.id}>
                        <img src={category.image} alt={category.name} />
                        <p>{category.name}</p>
                      </section>
                    )
                  ))}
                </section>
              )}
            </section>
          )}
        </main>
      </>
    );
  }
}

export default Client;
