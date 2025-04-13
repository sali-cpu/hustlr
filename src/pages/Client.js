import React from "react";
import '../stylesheets/style.css'; // if you have styles for this page
import { Link } from "react-router-dom";
import logo from '../images/logo.png';
import cuteWelcome from '../images/cute.jpg';

class Client extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      showWelcomeBox: true
    };
  }

  toggleMenu = () => {
    this.setState({ showMenu: !this.state.showMenu });
  };

  closeMessage = () => {
    this.setState({ showWelcomeBox: false });
  };

  render() {
    return (
      <>
        <header>
          <nav>
            <button className="menu" onClick={this.toggleMenu}>
              &#9776;
            </button>
            <ul
              id="menuList"
              style={{ display: this.state.showMenu ? "block" : "none" }}
            >
              <li><button>Settings</button></li>
              <li><button>Reports</button></li>
              <li><button>Help</button></li>
            </ul>
          </nav>
          <img src={logo} alt="Logo" />
          <Link to="/">
          <button className="signout">Sign Out</button>
            </Link>
        </header>

        <h1 className="centered-title">Client Homepage</h1>

        <main>
          {this.state.showWelcomeBox && (
            <section className="messagebox" id="welcomeBox">
              <button className="close" onClick={this.closeMessage}>×</button>
              <img src={cuteWelcome} alt="Cute Welcome" />
              <h2>Welcome, Client!</h2>
              <p>We’re excited to have you here! Our platform connects you with skilled freelancers ready to bring your projects to life. Explore, collaborate, and create something amazing today.</p>
            </section>
          )}
        </main>
      </>
    );
  }
}

export default Client;
