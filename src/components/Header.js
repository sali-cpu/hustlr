import React from "react";
import { Link } from "react-router-dom";
import '../stylesheets/Header.css';
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showSidebar: false,
    };
  }

  toggleSidebar = () => {
    this.setState((prevState) => ({
      showSidebar: !prevState.showSidebar,
    }));
  };

  render() {
    return (
      <>
        <header className="h1">Hustlr.</header>

        
        <div id="dashboard-toggle" onClick={this.toggleSidebar}>☰</div>

        <div id="sidebar" className={this.state.showSidebar ? "show" : ""}>
          <Link to="/SignUp">
          <button>Sign In</button>
        </Link>
          
        <Link to="/">
          <button>Home</button>
        </Link>
        <a href="#about">
     <button>About</button>
  </a>
</div>

        
      </>
    );
  }
}

export default Header;
