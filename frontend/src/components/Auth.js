import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert, Card, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/api';

const Auth = () => {
  const { updateAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'donor',
    charity: {
      name: '',
      description: '',
      mission_statement: '',
      location: '',
      founded_year: '',
      impact_metrics: '',
      contact_person: '',
      contact_phone: '',
      website: '',
      photo_url: ''
    }
  });
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('charity.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        charity: { ...formData.charity, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    toast.dismiss();

    try {
      const payload = { ...formData };
      if (formData.role !== 'charity') {
        delete payload.charity;
      }
      const response = await axios.post(`${API_URL}/${isLogin ? 'login' : 'register'}`, payload);
      
      if (isLogin) {
        updateAuth(response.data.access_token, response.data.role, response.data.user_id, response.data.charity_id || null);
        toast.success('Logged in successfully', { position: 'top-right', toastId: 'login-success', autoClose: 5000 });
        navigate(response.data.role === 'donor' ? '/donor' : response.data.role === 'charity' ? '/charity' : '/admin');
      } else {
        if (formData.role === 'charity') {
          toast.success('Charity registered, pending approval', { position: 'top-right', toastId: 'register-success', autoClose: 5000 });
          setIsLogin(true);
        } else {
          updateAuth(response.data.access_token, response.data.role, response.data.user_id, null);
          toast.success('Registered successfully', { position: 'top-right', toastId: 'register-success', autoClose: 5000 });
          navigate(response.data.role === 'donor' ? '/donor' : '/admin');
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || (isLogin ? 'Failed to login' : 'Failed to register');
      setError(message);
      toast.error(message, { position: 'top-right', toastId: 'auth-error', autoClose: 5000 });
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>{isLogin ? 'Login' : 'Register'}</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange}>
                <option value="donor">Donor</option>
                <option value="charity">Charity</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            {!isLogin && formData.role === 'charity' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Charity Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="charity.name"
                    value={formData.charity.name}
                    onChange={handleChange}
                    placeholder="Enter charity name"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="charity.description"
                    value={formData.charity.description}
                    onChange={handleChange}
                    placeholder="Enter charity description"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mission Statement</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="charity.mission_statement"
                    value={formData.charity.mission_statement}
                    onChange={handleChange}
                    placeholder="Enter mission statement"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="charity.location"
                    value={formData.charity.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Founded Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="charity.founded_year"
                    value={formData.charity.founded_year}
                    onChange={handleChange}
                    placeholder="Enter founded year"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Impact Metrics</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="charity.impact_metrics"
                    value={formData.charity.impact_metrics}
                    onChange={handleChange}
                    placeholder="Enter impact metrics"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Person</Form.Label>
                  <Form.Control
                    type="text"
                    name="charity.contact_person"
                    value={formData.charity.contact_person}
                    onChange={handleChange}
                    placeholder="Enter contact person"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="charity.contact_phone"
                    value={formData.charity.contact_phone}
                    onChange={handleChange}
                    placeholder="Enter contact phone"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="charity.website"
                    value={formData.charity.website}
                    onChange={handleChange}
                    placeholder="Enter website URL"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Photo URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="charity.photo_url"
                    value={formData.charity.photo_url}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                  />
                </Form.Group>
              </>
            )}
            <Button variant="primary" type="submit">
              {isLogin ? 'Login' : 'Register'}
            </Button>
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="ms-2"
            >
              {isLogin ? 'Need to register?' : 'Already have an account?'}
            </Button>
            {isLogin && (
              <Button
                variant="link"
                className="ms-2"
                style={{ fontSize: '0.9em' }}
                onClick={() => setShowReset(true)}
              >
                Forgot password?
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>
      {/* Password Reset Modal */}
      <Modal show={showReset} onHide={() => setShowReset(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={async (e) => {
              e.preventDefault();
              setResetLoading(true);
              setResetMessage('');
              try {
                await axios.post(`${API_URL}/password-reset/request`, { email: resetEmail });
                setResetMessage('If that email exists, a reset link will be sent.');
              } catch (err) {
                setResetMessage('Error sending reset email.');
              }
              setResetLoading(false);
            }}
          >
            <Form.Group>
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </Form.Group>
            <Button type="submit" className="mt-3" disabled={resetLoading}>
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            {resetMessage && <div className="mt-2">{resetMessage}</div>}
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Auth;