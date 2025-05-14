import React from "react";
import '../stylesheets/style.css';
import { Link } from "react-router-dom";
import cuteWelcome from '../images/cute.jpg';
import job from '../images/Job.png';
import pay from '../images/Payment.png';
import stat from '../images/Quick Stats.png';
import con from '../images/contract.png';
import rep from '../images/Reports.png';
import HeaderFreelancer from '../components/HeaderFreelancer';

class Freelancers extends React.Component {
  constructor(props) {
    super(props);
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    this.categories = [
      { 
        id: 1,
        name: "Jobs", 
        path: "/FreelancerJobs", 
        image: job,
        keywords: ["jobs", "work", "gigs", "opportunities"]
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
        path: "/FreelancerPayments", 
        image: pay,
        keywords: ["payments", "money", "earnings", "income", "csv"]
      },
      { 
        id: 4,
        name: "Reports", 
        path: "", 
        image: rep,
        keywords: ["reports", "analytics", "data"]
      },
      { 
        id: 5,
        name: "Quick Stats", 
        path: "/FQStats", 
        image: stat,
        keywords: ["stats", "statistics", "quick", "performance"]
      }
    ];

    this.state = {
      showWelcomeBox: !hasSeenWelcome,
      searchTerm: "",
    };
  }

  closeWelcomeMessage = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    this.setState({ showWelcomeBox: false });
  };

  handleSearchChange = (e) => {
    this.setState({ searchTerm: e.target.value.toLowerCase() });
  };

  handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled by the filteredCategories function
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
        <HeaderFreelancer />
        
        <form onSubmit={this.handleSearchSubmit} className="search-container">
          <section className="search-box">
            <input 
              type="text" 
              placeholder="Search for any service..." 
              onChange={this.handleSearchChange}
              value={this.state.searchTerm}
            />
            <button type="submit" className="search-icon">🔍</button>
          </section>
        </form>

        <main>
          {this.state.showWelcomeBox && (
            <section className="messagebox" id="welcomeBox">
              <button className="close" onClick={this.closeWelcomeMessage}>×</button>
              <img src={cuteWelcome} alt="Cute Welcome" />
              <h2>Welcome, Freelancer!</h2>
              <p>Access gigs, manage your profile, and collaborate with clients</p>
            </section>
          )}
        </main>

        {!this.state.showWelcomeBox && (
          <section className="categories">
            {filteredCategories.length === 0 ? (
              <section className="no-results">
                <p>No categories found matching your search.</p>
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
      </>
    );
  }
}

export default Freelancers;
