import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on page load
  useEffect(() => {
    const token = localStorage.getItem('stt_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    toast.success('Successfully logged in!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('stt_token');
    toast('Logged out successfully');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/auth"
          element={
            isAuthenticated ?
              <Navigate to="/dashboard" /> :
              <Auth onAuthSuccess={handleAuthSuccess} />
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ?
              <Dashboard onLogout={handleLogout} /> :
              <Navigate to="/auth" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;