import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';

const API_URL = 'https://tuinue-wasichana-v3.onrender.com';

function ProtectedRoute({ children, allowedRole }) {
  const { auth } = useContext(AuthContext);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      if (auth.token) {
        setIsValidating(true);
        try {
          await axios.get(`${API_URL}/verify-token`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          });
          setIsValid(true);
        } catch (err) {
          setIsValid(false);
          toast.error('Session expired. Please log in again.', { position: 'top-right' });
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          localStorage.removeItem('charityId');
        } finally {
          setIsValidating(false);
        }
      } else {
        setIsValid(false);
      }
    };
    validateToken();
  }, [auth.token]);

  if (isValidating) {
    return <div className="container mt-5">Loading...</div>;
  }

  if (!auth.token || isValid === false) {
    toast.warn('Please log in to access this page.', { position: 'top-right' });
    return <Navigate to="/auth" />;
  }

  if (allowedRole && auth.role !== allowedRole) {
    toast.warn(`Access denied. You are not a ${allowedRole}.`, { position: 'top-right' });
    // Role-based redirects
    if (auth.role === 'donor') return <Navigate to="/donor" />;
    if (auth.role === 'charity') return <Navigate to="/charity" />;
    if (auth.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;