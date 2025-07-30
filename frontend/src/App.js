import React, { createContext, useState  } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import Home from './components/Home';
import CharityProfile from './components/CharityProfile';
import DonorDashboard from './components/DonorDashboard';
import CharityDashboard from './components/CharityDashboard';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';

export const AuthContext = createContext();

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role')
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuth({ token: null, role: null });
    window.location.href = '/';
  };

  const updateAuth = (token, role) => {
    setAuth({ token, role });
  };

  return (
    <AuthContext.Provider value={{ auth, updateAuth }}>
      <Router>
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand href="/">
               Tuinue Wasichana
            </Navbar.Brand>
            <Navbar.Text className="d-none d-md-block text-white">
              Empowering girls through education and hygiene
            </Navbar.Text>
            <Nav className="ms-auto">
              <Nav.Link href="/">Home</Nav.Link>
              {auth.token ? (
                <>
                  {auth.role === 'donor' && <Nav.Link href="/donor">Donor Dashboard</Nav.Link>}
                  {auth.role === 'charity' && <Nav.Link href="/charity">Charity Dashboard</Nav.Link>}
                  {auth.role === 'admin' && <Nav.Link href="/admin">Admin Dashboard</Nav.Link>}
                  <Nav.Link as={Button} variant="link" onClick={handleLogout} className="text-white">Logout</Nav.Link>
                </>
              ) : (
                <Nav.Link href="/auth">Login/Register</Nav.Link>
              )}
            </Nav>
          </Container>
        </Navbar>
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
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