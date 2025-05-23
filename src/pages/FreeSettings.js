import { Link, useNavigate } from "react-router-dom";
import "../stylesheets/SettingsPage.css";
import HeaderClient from "../components/HeaderClient";
import FooterClient from "../components/FooterClient";

function FreeSettings() {
  const navigate = useNavigate();

  return (
     <>
          <HeaderClient />
    <main className="settings-container">
      <header className="settings-header">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <h2>Settings</h2>
      </header>

      <form className="settings-search" onSubmit={(e) => e.preventDefault()}>
        <input type="text" placeholder="Search for a setting..." />
      </form>

      <nav aria-label="Settings Options">
        <ul className="settings-list">
          <li>
            <Link to="/AboutSF" className="settings-button">
              👤 Account <strong className="arrow">›</strong>
            </Link>
          </li>
          <li>
            <button className="settings-button">
              🔔 Notifications <strong className="arrow">›</strong>
            </button>
          </li>
          <li>
            <button className="settings-button">
              👁️ Appearance <strong className="arrow">›</strong>
            </button>
          </li>
          <li>
            <button className="settings-button">
              🔒 Privacy & Security <strong className="arrow">›</strong>
            </button>
          </li>
          <li>
            <button className="settings-button">
              🎧 Help and Support <strong className="arrow">›</strong>
            </button>
          </li>
          <li>
            <button className="settings-button">
              ℹ️ About <strong className="arrow">›</strong>
            </button>
          </li>
        </ul>
      </nav>
    </main>
    <FooterClient />
    </>
  );
}

export default FreeSettings;
