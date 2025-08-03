import React, { useState, useEffect } from 'react';
import { authService, songsService } from '../services';

const ApiTestComponent = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing...');
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    const results = {};

    try {
      // Test 1: Health check
      try {
        console.log('Testing health endpoint...');
        const healthResponse = await fetch('http://localhost:5000/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!healthResponse.ok) {
          throw new Error(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
        }
        
        const healthData = await healthResponse.json();
        console.log('Health check successful:', healthData);
        results.health = { success: true, data: healthData };
      } catch (error) {
        console.error('Health check failed:', error);
        results.health = { success: false, error: error.message };
      }

      // Test 2: Try to register a test user (only if health check passed)
      if (results.health?.success) {
        try {
          console.log('Testing user registration...');
          const registerResponse = await authService.register({
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            name: 'Test User'
          });
          console.log('Registration successful:', registerResponse);
          results.register = { success: true, data: registerResponse };

          // Test 3: Try to get songs (should work if registration worked)
          try {
            console.log('Testing songs API...');
            const songsResponse = await songsService.getSongs();
            console.log('Songs API successful:', songsResponse);
            results.songs = { success: true, data: songsResponse };
          } catch (error) {
            console.error('Songs API failed:', error);
            results.songs = { success: false, error: error.message };
          }

        } catch (error) {
          console.error('Registration failed:', error);
          results.register = { success: false, error: error.message };
        }
      } else {
        results.register = { success: false, error: 'Skipped due to health check failure' };
        results.songs = { success: false, error: 'Skipped due to health check failure' };
      }

      setTestResults(results);
      
      // Determine overall status
      const hasSuccessfulConnection = results.health?.success;
      setConnectionStatus(hasSuccessfulConnection ? 'connected' : 'failed');

    } catch (error) {
      console.error('Test failed completely:', error);
      setConnectionStatus('failed');
      setTestResults({ error: error.message });
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#27ae60';
      case 'failed': return '#e74c3c';
      default: return '#f39c12';
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '2px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔗 Backend Connection Test</h3>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <div 
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            marginRight: '10px'
          }}
        />
        <strong>Status: {connectionStatus}</strong>
      </div>

      <div>
        <h4>Test Results:</h4>
        <pre style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>

      <button 
        onClick={testApiConnection}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Again
      </button>
    </div>
  );
};

export default ApiTestComponent;
