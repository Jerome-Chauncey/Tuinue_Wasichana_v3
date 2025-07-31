import React, { createContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Form,
  FormControl,
  Row,
  Col,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/Home";
import CharityProfile from "./components/CharityProfile";
import DonorDashboard from "./components/DonorDashboard";
import CharityDashboard from "./components/CharityDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import CharityList from "./components/CharityList";
import PurchaseCredits from "./components/PurchaseCredits";
import "./styles.css";
import axios from "axios";

export const AuthContext = createContext();

const API_URL = "https://tuinue-wasichana-v3.onrender.com";

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    userId: localStorage.getItem("userId"),
    charityId: localStorage.getItem("charityId"),
  });

  const updateAuth = (token, role, userId, charityId = null) => {
    setAuth({ token, role, userId, charityId });
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userId);
      if (charityId) localStorage.setItem("charityId", charityId);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      localStorage.removeItem("charityId");
    }
  };

  const handleLogout = () => {
    toast.dismiss();
    updateAuth(null, null, null, null);
    toast.success("Logged out successfully", {
      position: "top-right",
      toastId: "logout-success",
      autoClose: 5000,
    });
    window.location.href = "/";
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (auth.token) {
        try {
          const response = await axios.get(`${API_URL}/api/verify-token`, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.data.valid) {
            throw new Error(response.data.message || "Invalid token");
          }
        } catch (err) {
          toast.error(err.message || "Session expired, please log in again");
          updateAuth(null, null, null, null);
        }
      }
    };
    verifyToken();
  }, [auth.token]);

  return (
    <AuthContext.Provider value={{ auth, updateAuth }}>
      <Router>
        <Navbar expand="lg" className="sticky-top">
          <Container>
            <Navbar.Brand as={Link} to="/">
              <img src="/logo.png" alt="Tuinue Wasichana Logo" />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto">
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                <Nav.Link as={Link} to="/about">
                  About
                </Nav.Link>
                <Nav.Link as={Link} to="/charities">
                  Charities
                </Nav.Link>
                <Nav.Link as={Link} to="/stories">
                  Stories
                </Nav.Link>
                <Nav.Link as={Link} to="/contact">
                  Contact
                </Nav.Link>
                {auth.role === "donor" && (
                  <>
                    <Nav.Link as={Link} to="/donor">
                      Donor Dashboard
                    </Nav.Link>
                    <Nav.Link as={Link} to="/donor/purchase-credits">
                      Purchase Credits
                    </Nav.Link>
                  </>
                )}
                {auth.role === "charity" && (
                  <>
                    <Nav.Link as={Link} to="/charity">
                      Charity Dashboard
                    </Nav.Link>
                    <Nav.Link as={Link} to={`/charity/${auth.charityId}`}>
                      My Profile
                    </Nav.Link>
                  </>
                )}
                {auth.role === "admin" && (
                  <Nav.Link as={Link} to="/admin">
                    Admin Dashboard
                  </Nav.Link>
                )}
              </Nav>
              <Nav>
                {/* <Button as={Link} to="/donate" className="donate-btn mr-2">
                  <i className="fas fa-donate mr-2"></i> Donate
                </Button> */}
                {auth.token ? (
                  <Button
                    variant="link"
                    onClick={handleLogout}
                    className="text-dark"
                  >
                    Logout
                  </Button>
                ) : (
                  <Nav.Link as={Link} to="/auth">
                    Login/Register
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/charities" element={<CharityList />} />
          <Route path="/charity/:id" element={<CharityProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
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

        <footer className="">
          <Container>
            <Row>
              <Col md={4}>
                <h5>Tuinue Wasichana</h5>
                <p>
                  Empowering girls across Africa by tackling period poverty and
                  educational barriers with sustainable menstrual products and
                  health education.
                </p>
                <div>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-facebook-f social-icon"></i>
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-twitter social-icon"></i>
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-instagram social-icon"></i>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-linkedin-in social-icon"></i>
                  </a>
                  <div className="mt-3 text-center">
                    {" "}
                    <img
                      src="/logo.png"
                      alt="Company Logo"
                      style={{ width: "120px", marginRight: "300px" }}
                    />
                  </div>
                </div>
              </Col>
              <Col md={4}>
                <h5>Quick Links</h5>
                <Nav className="flex-column">
                  <Nav.Link as={Link} to="/">
                    Home
                  </Nav.Link>
                  <Nav.Link as={Link} to="/about">
                    About
                  </Nav.Link>
                  <Nav.Link as={Link} to="/charities">
                    Charities
                  </Nav.Link>
                  <Nav.Link as={Link} to="/stories">
                    Stories
                  </Nav.Link>
                  <Nav.Link as={Link} to="/contact">
                    Contact
                  </Nav.Link>
                  <Nav.Link as={Link} to="/donate">
                    Donate
                  </Nav.Link>
                </Nav>
              </Col>
              <Col md={4}>
                <h5>Join Our Newsletter</h5>
                <Form>
                  <Form.Group className="mb-3">
                    <FormControl
                      type="email"
                      placeholder="Enter email for updates"
                    />
                  </Form.Group>
                  <Button className="btn-cta">
                    <i className="fas fa-envelope mr-2"></i> Subscribe
                  </Button>
                </Form>
              </Col>
            </Row>
          </Container>
        </footer>

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
      </Router>
    </AuthContext.Provider>
  );
}

const About = () => (
  <Container className="py-5">
    <Row className="align-items-center">
      <Col md={6}>
        <h1>About Us</h1>
        <p className="">
          Tuinue Wasichana empowers girls in Africa by addressing period poverty
          and educational barriers with sustainable menstrual products and
          health education.
        </p>
        <Button as={Link} to="/donate" className="btn-cta">
          <i className="fas fa-donate mr-2"></i> Support Our Mission
        </Button>
      </Col>
      <Col md={6}>
        <div
          className="hero-image"
          style={{ backgroundImage: "url('/about-image.jpg')" }}
          role="img"
          aria-label="Girls learning in a classroom"
        ></div>
      </Col>
    </Row>
  </Container>
);

const Stories = () => (
  <Container className="py-5">
    <Row className="align-items-center">
      <Col md={6}>
        <h1>Stories of Impact</h1>
        <p className="">
          Discover inspiring stories of girls and communities transformed by
          your support, staying in school and thriving.
        </p>
        <Button as={Link} to="/charities" className="btn-cta">
          <i className="fas fa-book mr-2"></i> Explore Charities
        </Button>
      </Col>
      <Col md={6}>
        <div
          className="hero-image"
          style={{ backgroundImage: "url('/stories-image.jpg')" }}
          role="img"
          aria-label="Community celebration"
        ></div>
      </Col>
    </Row>
  </Container>
);

const Contact = () => (
  <Container className="py-5">
    <Row className="align-items-center">
      <Col md={6}>
        <h1>Contact Us</h1>
        <p className="">
          Reach out at{" "}
          <a href="mailto:info@tuinuewasichana.org">info@tuinuewasichana.org</a>{" "}
          or follow us on social media.
        </p>
        <Button as={Link} to="/donate" className="btn-cta">
          <i className="fas fa-donate mr-2"></i> Make a Difference
        </Button>
      </Col>
      <Col md={6}>
        <div
          className="hero-image"
          style={{ backgroundImage: "url('/contact-image.jpg')" }}
          role="img"
          aria-label="Girls connecting with community"
        ></div>
      </Col>
    </Row>
  </Container>
);

const Donate = () => (
  <Container className="py-5">
    <Row className="align-items-center">
      <Col md={6}>
        <h1>Donate Today</h1>
        <p className="">
          Your contribution keeps girls in school every day of the month. Join
          as a monthly donor or make a one-time gift.
        </p>
        <Button as={Link} to="/auth" className="btn-cta">
          <i className="fas fa-donate mr-2"></i> Become a Donor
        </Button>
      </Col>
      <Col md={6}>
        <div
          className="hero-image"
          style={{ backgroundImage: "url('/donate-image.jpg')" }}
          role="img"
          aria-label="Girls receiving support"
        ></div>
      </Col>
    </Row>
  </Container>
);

export default App;
