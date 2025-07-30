import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Modal } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard() {
  const [charities, setCharities] = useState([]);
  const [message, setMessage] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCharityId, setSelectedCharityId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/admin/charities`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCharities(res.data))
      .catch(err => setMessage(err.response.data.message));
  }, []);

  const handleApproveCharity = (charityId, approved) => {
    const token = localStorage.getItem('token');
    axios.post(
      `${API_URL}/admin/charities`,
      { charity_id: charityId, approved, rejected: false },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setMessage(res.data.message);
        setCharities(charities.map(c => c.id === charityId ? { ...c, approved, rejected: false } : c));
      })
      .catch(err => setMessage(err.response.data.message));
  };

  const handleRejectCharity = () => {
    const token = localStorage.getItem('token');
    axios.post(
      `${API_URL}/admin/charities`,
      { charity_id: selectedCharityId, approved: false, rejected: true },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setMessage(res.data.message);
        setCharities(charities.map(c => c.id === selectedCharityId ? { ...c, approved: false, rejected: true } : c));
        setShowRejectModal(false);
        setSelectedCharityId(null);
      })
      .catch(err => setMessage(err.response.data.message));
  };

  return (
    <div>
      <h1 className="text-primary mb-4">Admin Dashboard</h1>
      {message && <Alert variant={message.includes('Error') ? 'danger' : 'success'}>{message}</Alert>}
      <Card>
        <Card.Body>
          <Card.Title>Manage Charities</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Mission</th>
                <th>Impact Metrics</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {charities.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.location}</td>
                  <td>{c.mission_statement}</td>
                  <td>{c.impact_metrics}</td>
                  <td>{c.contact_person} ({c.contact_phone})</td>
                  <td>{c.rejected ? 'Rejected' : c.approved ? 'Approved' : 'Pending'}</td>
                  <td>
                    {!c.rejected && (
                      <Button
                        variant={c.approved ? 'warning' : 'success'}
                        onClick={() => handleApproveCharity(c.id, !c.approved)}
                        className="me-2"
                      >
                        {c.approved ? <FaTimes /> : <FaCheck />} {c.approved ? 'Unapprove' : 'Approve'}
                      </Button>
                    )}
                    {!c.approved && (
                      <Button
                        variant="danger"
                        onClick={() => {
                          setSelectedCharityId(c.id);
                          setShowRejectModal(true);
                        }}
                      >
                        <FaTimes /> Reject
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to reject this charity? They will be notified and unable to access the dashboard.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRejectCharity}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminDashboard;