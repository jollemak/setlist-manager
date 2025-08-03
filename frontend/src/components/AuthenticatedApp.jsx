import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthComponent from './AuthComponent';
import Header from './Header';

const AuthenticatedApp = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>🎵 Loading your setlists...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent />;
  }

  return (
    <>
      <Header />
      <div className="app-content">
        {children}
      </div>
    </>
  );
};

export default AuthenticatedApp;
