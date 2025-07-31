import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import { AuthContext } from '../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'https://tuinue-wasichana-v3.onrender.com';

const PurchaseCredits = () => {
  const { auth } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handlePurchase = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/api/credits/purchase`,
        { amount: parseInt(amount) },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      toast.success(`Purchased ${amount} credits! New balance: ${res.data.new_balance}`, { position: 'top-right' });
      setAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to purchase credits');
    }
  };

  return (
    <Container className="mt-4">
      <h2>Purchase Credits</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handlePurchase}>
        <Form.Group className="mb-3">
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter credit amount"
            required
          />
        </Form.Group>
        <Button type="submit" variant="primary">Purchase</Button>
      </Form>
      <ToastContainer />
    </Container>
  );
};

export default PurchaseCredits;