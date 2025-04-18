import React from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";
import '../stylesheets/ClientH.css';

class HeaderClient extends React.Component {
  render() {
    return (
        <section id="h">
        <nav>
          <div className="h">                    Hustlr.                           </div>
          <button className="b1">Ongoing Projects</button>
          <button className="b1">Earnings</button>
          <button className="b1">Settings</button>
          <button className="b1">Recent Activities</button>
          <Link to="/">
            <button className="signout header-item">Sign Out</button>
          </Link>
        </nav>
      </section>
      
          );
          
  }
}

export default HeaderClient;
