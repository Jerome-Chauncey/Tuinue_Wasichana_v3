import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/api';

const Auth = () => {
  const { updateAuth } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
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
      photo_url: ''  // New field
    }
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('charity.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, charity: { ...formData.charity, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            ...formData,
            role: formData.role,
            charity: formData.role === 'charity' ? formData.charity : undefined
          };
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      if (isLogin) {
        updateAuth(response.data.access_token, response.data.role, response.data.user_id, response.data.charity_id || null);
        toast.dismiss();
        toast.success('Logged in successfully', { position: 'top-right', toastId: 'login-success', autoClose: 5000 });
        window.location.href = response.data.role === 'charity' ? '/charity' : response.data.role === 'donor' ? '/donor' : '/admin';
      } else {
        toast.dismiss();
        toast.success(response.data.message || 'Registered successfully', { position: 'top-right', toastId: 'register-success', autoClose: 5000 });
        if (formData.role !== 'charity') {
          updateAuth(response.data.access_token, response.data.role, response.data.user_id, null);
          window.location.href = response.data.role === 'donor' ? '/donor' : '/admin';
        } else {
          setIsLogin(true);
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed');
      setError(message);
      toast.dismiss();
      toast.error(message, { position: 'top-right', toastId: isLogin ? 'login-error' : 'register-error', autoClose: 5000 });
    }
  };

  return (
    <Container className="mt-4">
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            required
          />
        </Form.Group>
        {!isLogin && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
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
            {formData.role === 'charity' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Charity Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="charity.name"
                    value={formData.charity.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="charity.description"
                    value={formData.charity.description}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Mission Statement</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="charity.mission_statement"
                    value={formData.charity.mission_statement}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="charity.location"
                    value={formData.charity.location}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Founded Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="charity.founded_year"
                    value={formData.charity.founded_year}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Impact Metrics</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="charity.impact_metrics"
                    value={formData.charity.impact_metrics}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Person</Form.Label>
                  <Form.Control
                    type="text"
                    name="charity.contact_person"
                    value={formData.charity.contact_person}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="charity.contact_phone"
                    value={formData.charity.contact_phone}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="charity.website"
                    value={formData.charity.website}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Charity Photo URL</Form.Label>
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
      </Form>
    </Container>
  );
};

export default Auth;