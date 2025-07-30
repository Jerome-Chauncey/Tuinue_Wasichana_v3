import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, ListGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://localhost:5000/api';

const CharityProfile = () => {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const response = await axios.get(`${API_URL}/charities/${id}`);
        setCharity(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch charity');
      }
    };
    fetchCharity();
  }, [id]);

  if (error) {
    return <Container className="mt-4"><p>{error}</p></Container>;
  }

  if (!charity) {
    return <Container className="mt-4"><p>Loading...</p></Container>;
  }

  return (
    <Container className="mt-4">
      <h1>{charity.name}</h1>
      {charity.photo_url && (
        <img
          src={charity.photo_url}
          alt={charity.name}
          style={{ maxWidth: '300px', marginBottom: '20px' }}
        />
      )}
      <Card className="mb-4">
        <Card.Body>
          <Card.Text><strong>Description:</strong> {charity.description}</Card.Text>
          <Card.Text><strong>Mission:</strong> {charity.mission_statement}</Card.Text>
          <Card.Text><strong>Location:</strong> {charity.location}</Card.Text>
          <Card.Text><strong>Founded:</strong> {charity.founded_year}</Card.Text>
          <Card.Text><strong>Contact:</strong> {charity.contact_person} ({charity.contact_phone})</Card.Text>
          {charity.website && (
            <Card.Text><strong>Website:</strong> <a href={charity.website}>{charity.website}</a></Card.Text>
          )}
        </Card.Body>
      </Card>
      <Card>
        <Card.Header>Beneficiary Stories</Card.Header>
        <Card.Body>
          {charity.stories.length === 0 ? (
            <p>No stories available.</p>
          ) : (
            <ListGroup>
              {charity.stories.map(story => (
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
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CharityProfile;