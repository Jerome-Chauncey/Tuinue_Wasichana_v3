import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/Home';
import CharityProfile from './components/CharityProfile';
import DonorDashboard from './components/DonorDashboard';
import CharityDashboard from './components/CharityDashboard';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import CharityList from './components/CharityList';
import PurchaseCredits from './components/PurchaseCredits'; 

export const AuthContext = createContext();

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('userId'),
    charityId: localStorage.getItem('charityId')
  });

  const updateAuth = (token, role, userId, charityId = null) => {
    setAuth({ token, role, userId, charityId });
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      if (charityId) localStorage.setItem('charityId', charityId);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('charityId');
    }
  };

  const handleLogout = () => {
    toast.dismiss(); // Clear existing toasts to prevent conflicts
    updateAuth(null, null, null, null);
    toast.success('Logged out successfully', { 
      position: 'top-right', 
      toastId: 'logout-success', 
      autoClose: 5000 
    });
    window.location.href = '/';
  };

  // Check token validity on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (auth.token) {
        try {
          const response = await fetch('http://localhost:5000/api/verify-token', {
            headers: { Authorization: `Bearer ${auth.token}` }
          });
          if (!response.ok) {
            toast.error('Session expired, please log in again', { 
              position: 'top-right', 
              toastId: 'session-expired' 
            });
            updateAuth(null, null, null, null);
          }
        } catch (err) {
          toast.error('Failed to verify session', { 
            position: 'top-right', 
            toastId: 'verify-error' 
          });
          updateAuth(null, null, null, null);
        }
      }
    };
    verifyToken();
  }, [auth.token]);

  return (
    <AuthContext.Provider value={{ auth, updateAuth }}>
      <Router>
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand href="/">Tuinue Wasichana</Navbar.Brand>
            <Navbar.Text className="d-none d-md-block text-white">
              Empowering girls through education and hygiene
            </Navbar.Text>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <Nav.Link href="/charities">Charities</Nav.Link>
                {auth.token ? (
                  <>
                    {auth.role === 'donor' && (
                      <>
                        <Nav.Link href="/donor">Donor Dashboard</Nav.Link>
                        <Nav.Link href="/donor/purchase-credits">Purchase Credits</Nav.Link>
                      </>
                    )}
                    {auth.role === 'charity' && (
                      <>
                        <Nav.Link href="/charity">Charity Dashboard</Nav.Link>
                        <Nav.Link href={`/charity/${auth.charityId}`}>My Profile</Nav.Link>
                      </>
                    )}
                    {auth.role === 'admin' && <Nav.Link href="/admin">Admin Dashboard</Nav.Link>}
                    <Nav.Link as={Button} variant="link" onClick={handleLogout} className="text-white">
                      Logout
                    </Nav.Link>
                  </>
                ) : (
                  <Nav.Link href="/auth">Login/Register</Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Container>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/charities" element={<CharityList />} />
            <Route path="/charity/:id" element={<CharityProfile />} />
            <Route
              path="/donor"
              element={
                <ProtectedRoute allowedRole="donor">
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/purchase-credits"
              element={
                <ProtectedRoute allowedRole="donor">
                  <PurchaseCredits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/charity"
              element={
                <ProtectedRoute allowedRole="charity">
                  <CharityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </Container>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;