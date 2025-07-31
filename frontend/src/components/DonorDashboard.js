import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Alert, Card, ListGroup, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'https://tuinue-wasichana-v3.onrender.com';

const DonorDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [credits, setCredits] = useState(0);
  const [creditHistory, setCreditHistory] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [charities, setCharities] = useState([]);
  const [error, setError] = useState('');
  const [donationForm, setDonationForm] = useState({
    charity_id: '',
    amount: '',
    is_anonymous: false
  });

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      if (!auth.token || auth.role !== 'donor') {
        setError('Not authorized');
        toast.dismiss();
        toast.error('Not authorized', { position: 'top-right', toastId: 'auth-error', autoClose: 5000 });
        return;
      }
      try {
        const [creditsResponse, creditHistoryResponse, donationHistoryResponse, charitiesResponse] = await Promise.all([
          axios.get(`${API_URL}/donor/credits`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          }).catch(err => ({ error: err })),
          axios.get(`${API_URL}/donor/credit-history`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          }).catch(err => ({ error: err })),
          axios.get(`${API_URL}/donor/history`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          }).catch(err => ({ error: err })),
          axios.get(`${API_URL}/charities`).catch(err => ({ error: err }))
        ]);

        if (creditsResponse.error) {
          throw new Error(creditsResponse.error.response?.data?.message || 'Failed to fetch credits');
        }
        if (creditHistoryResponse.error) {
          throw new Error(creditHistoryResponse.error.response?.data?.message || 'Failed to fetch credit history');
        }
        if (donationHistoryResponse.error) {
          throw new Error(donationHistoryResponse.error.response?.data?.message || 'Failed to fetch donation history');
        }
        if (charitiesResponse.error) {
          throw new Error(charitiesResponse.error.response?.data?.message || 'Failed to fetch charities');
        }

        setCredits(creditsResponse.data.credits || 0);
        setCreditHistory(creditHistoryResponse.data || []);
        setDonationHistory(donationHistoryResponse.data || []);
        setCharities(charitiesResponse.data || []);
      } catch (err) {
        const message = err.message || 'Failed to fetch donor data';
        setError(message);
        toast.dismiss();
        toast.error(message, { position: 'top-right', toastId: 'donor-error', autoClose: 5000 });
      }
    };
    fetchData();
  }, [auth.token, auth.role]);

  const handleDonationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonationForm({
      ...donationForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    toast.dismiss();

    if (!donationForm.charity_id || !donationForm.amount) {
      setError('Please select a charity and enter an amount');
      toast.error('Please select a charity and enter an amount', { position: 'top-right', toastId: 'donation-error', autoClose: 5000 });
      return;
    }
    if (isNaN(donationForm.amount) || donationForm.amount <= 0) {
      setError('Amount must be a positive number');
      toast.error('Amount must be a positive number', { position: 'top-right', toastId: 'donation-error', autoClose: 5000 });
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/donor/donate`,
        {
          charity_id: parseInt(donationForm.charity_id),
          amount: parseFloat(donationForm.amount),
          is_anonymous: donationForm.is_anonymous
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setCredits(response.data.new_balance);
      setDonationHistory([...donationHistory, response.data.donation]);
      setDonationForm({ charity_id: '', amount: '', is_anonymous: false });
      toast.success('Donation successful', { position: 'top-right', toastId: 'donation-success', autoClose: 5000 });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to make donation';
      setError(message);
      toast.error(message, { position: 'top-right', toastId: 'donation-error', autoClose: 5000 });
    }
  };

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="mt-4">
      <h1>Donor Dashboard</h1>
      <Card className="mb-4">
        <Card.Header>Credit Balance</Card.Header>
        <Card.Body>
          <Card.Text><strong>Credits:</strong> {credits}</Card.Text>
          <Link to="/donor/purchase-credits">
            <Button variant="primary">Purchase Credits</Button>
          </Link>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Make a Donation</Card.Header>
        <Card.Body>
          <Form onSubmit={handleDonationSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Charity</Form.Label>
              <Form.Select
                name="charity_id"
                value={donationForm.charity_id}
                onChange={handleDonationChange}
                required
              >
                <option value="">Choose a charity</option>
                {charities.map(charity => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={donationForm.amount}
                onChange={handleDonationChange}
                placeholder="Enter amount"
                min="1"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_anonymous"
                label="Donate anonymously"
                checked={donationForm.is_anonymous}
                onChange={handleDonationChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Donate
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Donation History</Card.Header>
        <Card.Body>
          {donationHistory.length === 0 ? (
            <p>No donations made yet.</p>
          ) : (
            <ListGroup>
              {donationHistory.map(donation => (
                <ListGroup.Item key={donation.id}>
                  Donated {donation.amount} credits to {donation.charity_name} on{' '}
                  {new Date(donation.date).toLocaleDateString()}{' '}
                  {donation.is_anonymous && '(Anonymous)'}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Credit Transaction History</Card.Header>
        <Card.Body>
          {creditHistory.length === 0 ? (
            <p>No credit transactions yet.</p>
          ) : (
            <ListGroup>
              {creditHistory.map(transaction => (
                <ListGroup.Item key={transaction.id}>
                  Purchased {transaction.amount} credits on{' '}
                  {new Date(transaction.date).toLocaleDateString()}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Available Charities</Card.Header>
        <Card.Body>
          {charities.length === 0 ? (
            <p>No charities available.</p>
          ) : (
            <div className="row">
              {charities.map(charity => (
                <Card key={charity.id} className="col-md-4 mb-4">
                  {charity.photo_url && (
                    <Card.Img
                      variant="top"
                      src={charity.photo_url}
                      alt={charity.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{charity.name}</Card.Title>
                    <Card.Text>{charity.description}</Card.Text>
                    <Link to={`/charity/${charity.id}`}>
                      <Button variant="primary">View Details</Button>
                    </Link>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DonorDashboard;