import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
                  <h1>🎵 Setlist Manager</h1>
                  <p>Edit and manage your song lyrics and setlists</p>
        </div>
        
        <div className="user-info">
          <span className="welcome-text">Welcome, {user?.name}!</span>
          <button 
            onClick={handleLogout}
            className="logout-btn"
            title="Logout"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
