import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import { Container, Alert, Card, Table, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = 'https://tuinue-wasichana-v3.onrender.com';

const AdminDashboard = () => {
  const [charities, setCharities] = useState([]);
  const [donors, setDonors] = useState([]);
  const [overview, setOverview] = useState({});
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      try {
        const [charitiesRes, donorsRes, overviewRes] = await Promise.all([
          axios.get(`${API_URL}/api/admin/charities`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/admin/donors`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/admin-overview`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCharities(charitiesRes.data);
        setDonors(donorsRes.data);
        setOverview(overviewRes.data);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.';
        setError(message);
        toast.dismiss(); // Clear existing toasts
        toast.error(message, { position: 'top-right', toastId: 'fetch-error', autoClose: 5000 });
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleApprove = async (charityId, approved, rejected) => {
    try {
      await axios.post(
        `${API_URL}/api/admin/charities`,
        { charity_id: charityId, approved, rejected },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCharities(charities.map(c => c.id === charityId ? { ...c, approved, rejected } : c));
      toast.dismiss(); // Clear existing toasts
      toast.success('Charity status updated', { position: 'top-right', toastId: 'approve-success', autoClose: 5000 });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update charity';
      setError(message);
      toast.dismiss(); // Clear existing toasts
      toast.error(message, { position: 'top-right', toastId: 'approve-error', autoClose: 5000 });
    }
  };

  const donationChartData = {
    labels: overview.donation_graph?.labels || [],
    datasets: [
      {
        label: 'Donations Made (Credits)',
        data: overview.donation_graph?.donor_data || [],
        borderColor: '#4BC0C0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      },
      {
        label: 'Donations Received (Credits)',
        data: overview.donation_graph?.charity_data || [],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true
      }
    ]
  };

  const creditChartData = {
    labels: overview.credit_graph?.labels || [],
    datasets: [
      {
        label: 'Credit Purchases (Credits)',
        data: overview.credit_graph?.data || [],
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Performance Over Time' }
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Admin Dashboard</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Header>Platform Overview</Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-4">
              <h5>Total Donors: {overview.total_donors || 0}</h5>
              <h5>Total Charities: {overview.total_charities || 0}</h5>
            </div>
            <div className="col-md-4">
              <h5>Total Donations: {overview.total_donations || 0}</h5>
              <h5>Total Credits Donated: {overview.total_credits_donated || 0}</h5>
            </div>
            <div className="col-md-4">
              <h5>Total Stories: {overview.total_stories || 0}</h5>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Donation and Credit Purchase Trends</Card.Header>
        <Card.Body>
          <Line data={donationChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Donation Trends' } } }} />
          <Line data={creditChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Credit Purchase Trends' } } }} />
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Charities</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Donations</th>
                <th>Stories</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {charities.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.location}</td>
                  <td>{c.approved ? 'Approved' : c.rejected ? 'Rejected' : 'Pending'}</td>
                  <td>
                    {c.donations.length} (Total: {c.donations.reduce((sum, d) => sum + d.amount, 0)} credits)
                    <ul>
                      {c.donations.map(d => (
                        <li key={d.id}>
                          {d.donor_username} donated {d.amount} credits on {new Date(d.date).toLocaleDateString()} {d.is_anonymous && '(Anonymous)'}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {c.stories.length}
                    <ul>
                      {c.stories.map(s => (
                        <li key={s.id}>{s.title} (Posted: {new Date(s.date).toLocaleDateString()})</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {!c.approved && !c.rejected && (
                      <>
                        <Button className="me-2" variant="success" size="sm" onClick={() => handleApprove(c.id, true, false)}>Approve</Button>
                        <Button variant="danger" size="sm" onClick={() => handleApprove(c.id, false, true)}>Reject</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Donors</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Credits</th>
                <th>Donations</th>
                <th>Credit Purchases</th>
              </tr>
            </thead>
            <tbody>
              {donors.map(d => (
                <tr key={d.id}>
                  <td>{d.username}</td>
                  <td>{d.email}</td>
                  <td>{d.credits}</td>
                  <td>
                    {d.donations.length} (Total: {d.donations.reduce((sum, don) => sum + don.amount, 0)} credits)
                    <ul>
                      {d.donations.map(don => (
                        <li key={don.id}>
                          Donated {don.amount} credits to {don.charity_name} on {new Date(don.date).toLocaleDateString()} {don.is_anonymous && '(Anonymous)'}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {d.credit_transactions.length} (Total: {d.credit_transactions.reduce((sum, t) => sum + t.amount, 0)} credits)
                    <ul>
                      {d.credit_transactions.map(t => (
                        <li key={t.id}>
                          Purchased {t.amount} credits on {new Date(t.date).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;