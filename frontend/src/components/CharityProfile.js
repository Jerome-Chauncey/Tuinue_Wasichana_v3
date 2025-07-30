import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { FaDonate } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function CharityProfile() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [stories, setStories] = useState([]);
  const [donationAmount, setDonationAmount] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/charities/${id}`)
      .then(res => setCharity(res.data))
      .catch(err => setMessage('Error loading charity'));
    axios.get(`${API_URL}/stories?charity_id=${id}`)
      .then(res => setStories(res.data))
      .catch(err => setMessage('Error loading stories'));
  }, [id]);

  const handleDonate = () => {
    const token = localStorage.getItem('token');
    axios.post(
      `${API_URL}/donate`,
      {
        charity_id: id,
        amount: parseInt(donationAmount),
        is_anonymous: isAnonymous,
        is_recurring: isRecurring,
        recurring_frequency: isRecurring ? 'monthly' : null
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => setMessage('Donation successful!'))
      .catch(err => setMessage(err.response.data.message));
  };

  if (!charity) return <div>Loading...</div>;

  return (
    <div>
      <Card className="mb-4">
        <Card.Img variant="top" src="https://via.placeholder.com/800x400?text=Charity+Banner" />
        <Card.Body>
          <Card.Title className="text-primary">{charity.name}</Card.Title>
          <Card.Text>{charity.description}</Card.Text>
        </Card.Body>
      </Card>
      {message && <Alert variant={message.includes('Error') ? 'danger' : 'success'}>{message}</Alert>}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title><FaDonate /> Donate to Empower Girls</Card.Title>
          <Form.Group className="mb-3">
            <Form.Label>Tuinue Credits</Form.Label>
            <Form.Control
              type="number"
              value={donationAmount}
              onChange={e => setDonationAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </Form.Group>
          <Form.Check
            type="checkbox"
            label="Anonymous Donation"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            className="mb-3"
          />
          <Form.Check
            type="checkbox"
            label="Monthly Donation"
            checked={isRecurring}
            onChange={e => setIsRecurring(e.target.checked)}
            className="mb-3"
          />
          <Button onClick={handleDonate} variant="primary">
            Donate Now
          </Button>
        </Card.Body>
      </Card>
      <h2>Beneficiary Stories</h2>
      {stories.map(story => (
        <Card key={story.id} className="mb-3">
          <Card.Img variant="top" src="https://via.placeholder.com/150?text=Story" />
          <Card.Body>
            <Card.Title>{story.title}</Card.Title>
            <Card.Text>{story.content}</Card.Text>
            <Card.Footer>{new Date(story.date).toLocaleDateString()}</Card.Footer>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default CharityProfile;