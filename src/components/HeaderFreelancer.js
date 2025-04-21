import React from "react";
import "../stylesheets/Final.css";

class HeaderClient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobileMenuOpen: false,
    };
  }

  toggleMenu = () => {
    this.setState((prevState) => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen,
    }), () => {
      if (this.state.isMobileMenuOpen) {
        document.body.classList.add("show-mobile-menu");
      } else {
        document.body.classList.remove("show-mobile-menu");
      }
    });
  };

  render() {
    return (
      <header className="head">
        <nav className="nbar">
          <a href="#" className="nlogo">
            <h2 className="logo-text">Hustlr.</h2>
          </a>
          <ul className="nmenu">
            <button
              id="menclose"
              className="fas fa-times"
              onClick={this.toggleMenu}
            ></button>
            <li className="nitem"><a href="#" className="nlink">Ongoing Projects</a></li>
            <li className="nitem"><a href="#" className="nlink">Earnings</a></li>
            <li className="nitem"><a href="#" className="nlink">Settings</a></li>
            <li className="nitem"><a href="#" className="nlink">Recent Activities</a></li>
            <li className="nitem"><a href="/" className="nlink">Sign Out</a></li>
          </ul>
          <button
            id="menopen"
            className="fas fa-bars"
            onClick={this.toggleMenu}
          ></button>
        </nav>
      </header>
    );
  }
}

export default HeaderClient;
