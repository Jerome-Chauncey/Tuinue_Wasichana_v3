import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const API_URL = 'http://localhost:5000/api';

function Auth() {
  const { updateAuth } = useContext(AuthContext);
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
      website: ''
    }
  });
  const [message, setMessage] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const url = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
    try {
      const res = await axios.post(url, formData);
      if (!res || !res.data) {
        setMessage('Invalid response from server');
        return;
      }
      if (isLogin) {
        if (res.data.message?.includes('pending')) {
          setShowPendingModal(true);
        } else if (res.data.message?.includes('not approved')) {
          setShowRejectedModal(true);
        } else {
          setMessage('Login successful!');
          localStorage.setItem('token', res.data.access_token);
          localStorage.setItem('role', res.data.role);
          updateAuth(res.data.access_token, res.data.role);
          navigate(res.data.role === 'donor' ? '/donor' : res.data.role === 'charity' ? '/charity' : '/admin');
        }
      } else {
        setMessage('Registration successful!');
        if (res.data.pending) {
          setShowPendingModal(true);
          setTimeout(() => navigate('/'), 3000);
        } else {
          localStorage.setItem('token', res.data.access_token);
          localStorage.setItem('role', res.data.role);
          updateAuth(res.data.access_token, res.data.role);
          navigate(res.data.role === 'donor' ? '/donor' : res.data.role === 'charity' ? '/charity' : '/admin');
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to connect to server. Please check if the backend is running.');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary">
        {isLogin ? <FaSignInAlt /> : <FaUserPlus />} {isLogin ? 'Login' : 'Register'}
      </h1>
      {message && <Alert variant={message.includes('Error') || message.includes('pending') || message.includes('not approved') || message.includes('Failed') ? 'danger' : 'success'}>{message}</Alert>}
      <Form className="w-50 mx-auto">
        {!isLogin && (
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
          </Form.Group>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </Form.Group>
        {!isLogin && (
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="donor">Donor</option>
              <option value="charity">Charity</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        )}
        {!isLogin && formData.role === 'charity' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Charity Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.charity.name}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, name: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.charity.description}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, description: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mission Statement</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.charity.mission_statement}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, mission_statement: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location (e.g., Nairobi, Kenya)</Form.Label>
              <Form.Control
                type="text"
                value={formData.charity.location}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, location: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Founded Year</Form.Label>
              <Form.Control
                type="number"
                value={formData.charity.founded_year}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, founded_year: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Impact Metrics (e.g., Supported 500 girls)</Form.Label>
              <Form.Control
                type="text"
                value={formData.charity.impact_metrics}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, impact_metrics: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Person</Form.Label>
              <Form.Control
                type="text"
                value={formData.charity.contact_person}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, contact_person: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Phone</Form.Label>
              <Form.Control
                type="text"
                value={formData.charity.contact_phone}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, contact_phone: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Website (optional)</Form.Label>
              <Form.Control
                type="url"
                value={formData.charity.website}
                onChange={e => setFormData({ ...formData, charity: { ...formData.charity, website: e.target.value } })}
              />
            </Form.Group>
          </>
        )}
        <Button onClick={handleSubmit} variant="primary" className="w-100 mb-3">
          {isLogin ? 'Login' : 'Register'}
        </Button>
        <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </Button>
      </Form>
      <Modal show={showPendingModal} onHide={() => setShowPendingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Application Pending</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your charity application has been submitted and is awaiting admin approval. You will be notified via email once approved.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => { setShowPendingModal(false); navigate('/'); }}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showRejectedModal} onHide={() => setShowRejectedModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Application Rejected</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          We are sorry, your charity application was not approved. For further details or to appeal this decision, please contact our team at support@tuinuewasichana.org.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowRejectedModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Auth;