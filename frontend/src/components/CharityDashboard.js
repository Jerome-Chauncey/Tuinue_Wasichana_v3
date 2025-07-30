import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Table } from 'react-bootstrap';
import { FaPlus, FaWallet } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function CharityDashboard() {
  const [story, setStory] = useState({ title: '', content: '', image_url: '', beneficiary_name: '', beneficiary_age: '' });
  const [donations, setDonations] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ approved: false, rejected: false });

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Check approval/rejection status
    axios.get(`${API_URL}/charity/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStatus({ approved: res.data.approved, rejected: res.data.rejected }))
      .catch(err => setMessage(err.response.data.message));
    // Fetch donation history and total credits
    axios.get(`${API_URL}/charity/donations`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setDonations(res.data.donations);
        setTotalCredits(res.data.total_credits);
      })
      .catch(err => setMessage(err.response.data.message));
  }, []);

  const handleAddStory = () => {
    const token = localStorage.getItem('token');
    axios.post(`${API_URL}/stories`, story, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setMessage(res.data.message);
        setStory({ title: '', content: '', image_url: '', beneficiary_name: '', beneficiary_age: '' });
      })
      .catch(err => setMessage(err.response.data.message));
  };

  if (status.rejected) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          We are sorry, your charity application was not approved. For further details or to appeal this decision, please contact our team at support@tuinuewasichana.org.
        </Alert>
      </div>
    );
  }

  if (!status.approved) {
    return (
      <div className="container mt-5">
        <Alert variant="warning">
          Your charity application is pending approval. You will be notified via email once approved.
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-primary mb-4">Charity Dashboard</h1>
      {message && <Alert variant={message.includes('Error') ? 'danger' : 'success'}>{message}</Alert>}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title><FaPlus className="me-2" /> Add Beneficiary Story</Card.Title>
          <Form.Group className="mb-3">
            <Form.Label>Story Title</Form.Label>
            <Form.Control
              type="text"
              value={story.title}
              onChange={e => setStory({ ...story, title: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Beneficiary Name</Form.Label>
            <Form.Control
              type="text"
              value={story.beneficiary_name}
              onChange={e => setStory({ ...story, beneficiary_name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Beneficiary Age</Form.Label>
            <Form.Control
              type="number"
              value={story.beneficiary_age}
              onChange={e => setStory({ ...story, beneficiary_age: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Story Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={story.content}
              onChange={e => setStory({ ...story, content: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image URL (e.g., hosted image link)</Form.Label>
            <Form.Control
              type="url"
              value={story.image_url}
              onChange={e => setStory({ ...story, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <Form.Text>Upload an image and provide its URL (e.g., via Imgur or similar).</Form.Text>
          </Form.Group>
          <Button onClick={handleAddStory} variant="primary">Add Story</Button>
        </Card.Body>
      </Card>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title><FaWallet className="me-2" /> Total Credits: {totalCredits}</Card.Title>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Card.Title>Donation History</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Donor ID</th>
                <th>Amount</th>
                <th>Anonymous</th>
                <th>Recurring</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d.id}>
                  <td>{d.is_anonymous ? 'Anonymous' : d.donor_id}</td>
                  <td>{d.amount}</td>
                  <td>{d.is_anonymous ? 'Yes' : 'No'}</td>
                  <td>{d.is_recurring ? 'Yes' : 'No'}</td>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default CharityDashboard;