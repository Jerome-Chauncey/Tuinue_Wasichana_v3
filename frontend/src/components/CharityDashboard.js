import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Container, Alert, Card, ListGroup, Form, Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://localhost:5000/api';

const CharityDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [status, setStatus] = useState(null);
  const [donations, setDonations] = useState([]);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState('');
  const [storyForm, setStoryForm] = useState({ title: '', content: '', photo_url: '' });
  const [editStory, setEditStory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      if (!auth.charityId) {
        setError('Charity ID not found. Please log in again.');
        toast.dismiss();
        toast.error('Charity ID not found. Please log in again.', { position: 'top-right', toastId: 'charity-id-error', autoClose: 5000 });
        return;
      }
      try {
        const [statusResponse, donationsResponse, storiesResponse] = await Promise.all([
          axios.get(`${API_URL}/charity/status`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          }),
          axios.get(`${API_URL}/charity/donations`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          }),
          axios.get(`${API_URL}/stories?charity_id=${auth.charityId}`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          }).catch(err => {
            if (err.response?.status === 404) {
              return { data: [] };
            }
            throw err;
          })
        ]);
        setStatus(statusResponse.data);
        setDonations(donationsResponse.data);
        setStories(storiesResponse.data);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to fetch charity data';
        setError(message);
        toast.dismiss();
        toast.error(message, { position: 'top-right', toastId: 'charity-error', autoClose: 5000 });
      }
    };
    if (auth.token && auth.role === 'charity') {
      fetchData();
    } else {
      setError('Not authorized');
      toast.dismiss();
      toast.error('Not authorized', { position: 'top-right', toastId: 'auth-error', autoClose: 5000 });
    }
  }, [auth.token, auth.role, auth.charityId]);

  const handleStoryChange = (e) => {
    const { name, value } = e.target;
    setStoryForm({ ...storyForm, [name]: value });
  };

  const handleEditStoryChange = (e) => {
    const { name, value } = e.target;
    setEditStory({ ...editStory, [name]: value });
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    if (!storyForm.title.trim() || !storyForm.content.trim()) {
      setError('Title and content are required');
      toast.dismiss();
      toast.error('Title and content are required', { position: 'top-right', toastId: 'story-error', autoClose: 5000 });
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/stories`,
        storyForm,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setStories([...stories, response.data.story]);
      setStoryForm({ title: '', content: '', photo_url: '' });
      toast.dismiss();
      toast.success('Story created successfully', { position: 'top-right', toastId: 'story-success', autoClose: 5000 });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create story';
      setError(message);
      toast.dismiss();
      toast.error(message, { position: 'top-right', toastId: 'story-error', autoClose: 5000 });
    }
  };

  const handleEditStorySubmit = async (e) => {
    e.preventDefault();
    if (!editStory.title.trim() || !editStory.content.trim()) {
      setError('Title and content are required');
      toast.dismiss();
      toast.error('Title and content are required', { position: 'top-right', toastId: 'edit-story-error', autoClose: 5000 });
      return;
    }
    try {
      const response = await axios.put(
        `${API_URL}/stories/${editStory.id}`,
        editStory,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setStories(stories.map(s => s.id === editStory.id ? response.data.story : s));
      setEditStory(null);
      setShowEditModal(false);
      toast.dismiss();
      toast.success('Story updated successfully', { position: 'top-right', toastId: 'edit-story-success', autoClose: 5000 });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update story';
      setError(message);
      toast.dismiss();
      toast.error(message, { position: 'top-right', toastId: 'edit-story-error', autoClose: 5000 });
    }
  };

  const openEditModal = (story) => {
    setEditStory(story);
    setShowEditModal(true);
  };

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!status) {
    return <Container className="mt-4"><p>Loading...</p></Container>;
  }

  return (
    <Container className="mt-4">
      <h1>Charity Dashboard</h1>
      <Card className="mb-4">
        <Card.Header>Charity Status</Card.Header>
        <Card.Body>
          <Card.Text><strong>Name:</strong> {status.name}</Card.Text>
          <Card.Text>
            <strong>Status:</strong>{' '}
            {status.approved ? 'Approved' : status.rejected ? 'Rejected' : 'Pending'}
          </Card.Text>
          {!status.approved && !status.rejected && (
            <Alert variant="warning">
              Your charity application is pending approval. Please wait for admin review.
            </Alert>
          )}
          {status.rejected && (
            <Alert variant="danger">
              Your charity application was rejected. Please contact support@tuinuewasichana.org.
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Create Beneficiary Story</Card.Header>
        <Card.Body>
          {status.approved ? (
            <Form onSubmit={handleStorySubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={storyForm.title}
                  onChange={handleStoryChange}
                  placeholder="Enter story title"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="content"
                  value={storyForm.content}
                  onChange={handleStoryChange}
                  placeholder="Enter story content"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Photo URL</Form.Label>
                <Form.Control
                  type="url"
                  name="photo_url"
                  value={storyForm.photo_url}
                  onChange={handleStoryChange}
                  placeholder="https://example.com/photo.jpg"
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Create Story
              </Button>
            </Form>
          ) : (
            <Alert variant="info">
              Story creation is available only for approved charities.
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>Beneficiary Stories</Card.Header>
        <Card.Body>
          {stories.length === 0 ? (
            <p>No stories created yet.</p>
          ) : (
            <ListGroup>
              {stories.map(story => (
                <ListGroup.Item key={story.id}>
                  <h5>{story.title}</h5>
                  <p>{story.content}</p>
                  {story.photo_url && (
                    <img
                      src={story.photo_url}
                      alt={story.title}
                      style={{ maxWidth: '200px', marginTop: '10px' }}
                    />
                  )}
                  <p><small>Posted on {new Date(story.date).toLocaleDateString()}</small></p>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEditModal(story)}
                  >
                    Edit
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Donations Received</Card.Header>
        <Card.Body>
          {donations.length === 0 ? (
            <p>No donations received yet.</p>
          ) : (
            <ListGroup>
              {donations.map(donation => (
                <ListGroup.Item key={donation.id}>
                  {donation.donor_username} donated {donation.amount} credits on{' '}
                  {new Date(donation.date).toLocaleDateString()}{' '}
                  {donation.is_anonymous && '(Anonymous)'}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Story</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editStory && (
            <Form onSubmit={handleEditStorySubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editStory.title}
                  onChange={handleEditStoryChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="content"
                  value={editStory.content}
                  onChange={handleEditStoryChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Photo URL</Form.Label>
                <Form.Control
                  type="url"
                  name="photo_url"
                  value={editStory.photo_url || ''}
                  onChange={handleEditStoryChange}
                  placeholder="https://example.com/photo.jpg"
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                className="ms-2"
              >
                Cancel
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CharityDashboard;