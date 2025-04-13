import React from "react";
import '../stylesheets/style.css'; // if you have styles for this page
import { Link } from "react-router-dom";
import logo from '../images/logo.png';
import cuteWelcome from '../images/cute.jpg';
class Freelancers extends React.Component {
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

        <h1 className="centered-title">Freelancers Homepage</h1>

        <main>
          {this.state.showWelcomeBox && (
            <section className="messagebox" id="welcomeBox">
              <button className="close" onClick={this.closeMessage}>×</button>
              <img src={cuteWelcome} alt="Cute Welcome" />
              <h2>Welcome, Admin!</h2>
              <p>
              Access gigs, manage your profile, and collaborate with clients
              </p>
            </section>
          )}
        </main>
      </>
    );
  }
}

export default Freelancers;
