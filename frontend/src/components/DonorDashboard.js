import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Alert, Dropdown } from 'react-bootstrap';
import { FaWallet, FaBell, FaDonate } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function DonorDashboard() {
  const [credits, setCredits] = useState(0);
  const [donations, setDonations] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [creditAmount, setCreditAmount] = useState(0);
  const [donation, setDonation] = useState({ charityId: '', amount: 0, isAnonymous: false, isRecurring: false });
  const [charities, setCharities] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Fetch credits
    axios.get(`${API_URL}/donor/credits`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCredits(res.data.credits))
      .catch(err => setMessage(err.response.data.message));
    // Fetch donation history
    axios.get(`${API_URL}/donor/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDonations(res.data))
      .catch(err => setMessage(err.response.data.message));
    // Fetch credit transaction history
    axios.get(`${API_URL}/donor/credit-history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCreditTransactions(res.data))
      .catch(err => setMessage(err.response.data.message));
    // Fetch charities for donation dropdown
    axios.get(`${API_URL}/charities`)
      .then(res => setCharities(res.data))
      .catch(err => setMessage(err.response.data.message));
  }, []);

  const handlePurchaseCredits = () => {
    const token = localStorage.getItem('token');
    axios.post(
      `${API_URL}/credits/purchase`,
      { amount: parseInt(creditAmount) },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setCredits(res.data.new_balance);
        setCreditTransactions([...creditTransactions, { id: Date.now(), amount: parseInt(creditAmount), date: new Date().toISOString() }]);
        setMessage(res.data.message);
        setCreditAmount(0);
      })
      .catch(err => setMessage(err.response.data.message));
  };

  const handleDonate = () => {
    const token = localStorage.getItem('token');
    axios.post(
      `${API_URL}/donate`,
      {
        charity_id: donation.charityId,
        amount: parseInt(donation.amount),
        is_anonymous: donation.isAnonymous,
        is_recurring: donation.isRecurring,
        recurring_frequency: donation.isRecurring ? 'monthly' : null
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setCredits(res.data.new_balance);
        setDonations([...donations, {
          id: Date.now(),
          charity_id: donation.charityId,
          charity_name: charities.find(c => c.id === parseInt(donation.charityId))?.name || 'Unknown',
          amount: parseInt(donation.amount),
          is_anonymous: donation.isAnonymous,
          is_recurring: donation.isRecurring,
          date: new Date().toISOString()
        }]);
        setMessage(res.data.message);
        setDonation({ charityId: '', amount: 0, isAnonymous: false, isRecurring: false });
      })
      .catch(err => setMessage(err.response.data.message));
  };

  const handleSetReminder = () => {
    const token = localStorage.getItem('token');
    axios.post(`${API_URL}/reminders`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setMessage(res.data.message))
      .catch(err => setMessage(err.response.data.message));
  };

  return (
    <div>
      <h1 className="text-primary mb-4">Donor Dashboard</h1>
      {message && <Alert variant={message.includes('Error') ? 'danger' : 'success'}>{message}</Alert>}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title><FaWallet className="me-2" /> Tuinue Credits: {credits}</Card.Title>
          <Form.Group className="mb-3">
            <Form.Label>Purchase Credits</Form.Label>
            <Form.Control
              type="number"
              value={creditAmount}
              onChange={e => setCreditAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </Form.Group>
          <Button onClick={handlePurchaseCredits} variant="primary">Purchase Credits</Button>
        </Card.Body>
      </Card>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title><FaDonate className="me-2" /> Make a Donation</Card.Title>
          <Form.Group className="mb-3">
            <Form.Label>Select Charity</Form.Label>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="charity-dropdown">
                {donation.charityId ? charities.find(c => c.id === parseInt(donation.charityId))?.name : 'Select Charity'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {charities.map(c => (
                  <Dropdown.Item key={c.id} onClick={() => setDonation({ ...donation, charityId: c.id })}>
                    {c.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount (Credits)</Form.Label>
            <Form.Control
              type="number"
              value={donation.amount}
              onChange={e => setDonation({ ...donation, amount: e.target.value })}
              placeholder="Enter amount"
            />
          </Form.Group>
          <Form.Check
            type="checkbox"
            label="Anonymous Donation"
            checked={donation.isAnonymous}
            onChange={e => setDonation({ ...donation, isAnonymous: e.target.checked })}
            className="mb-3"
          />
          <Form.Check
            type="checkbox"
            label="Monthly Donation"
            checked={donation.isRecurring}
            onChange={e => setDonation({ ...donation, isRecurring: e.target.checked })}
            className="mb-3"
          />
          <Button onClick={handleDonate} variant="primary">Donate Now</Button>
        </Card.Body>
      </Card>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title><FaBell className="me-2" /> Donation Reminders</Card.Title>
          <Button onClick={handleSetReminder} variant="primary">Set Monthly Reminder</Button>
        </Card.Body>
      </Card>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Donation History</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Charity</th>
                <th>Amount</th>
                <th>Anonymous</th>
                <th>Recurring</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d.id}>
                  <td>{d.charity_name}</td>
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
      <Card>
        <Card.Body>
          <Card.Title>Credit Transaction History</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {creditTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.amount}</td>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default DonorDashboard;