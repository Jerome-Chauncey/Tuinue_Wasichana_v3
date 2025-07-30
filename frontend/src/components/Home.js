import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, ListGroup, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = 'http://localhost:5000/api';

const Home = () => {
  const [charities, setCharities] = useState([]);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charitiesResponse, storiesResponse] = await Promise.all([
          axios.get(`${API_URL}/charities`),
          axios.get(`${API_URL}/stories`)
        ]);
        setCharities(charitiesResponse.data);
        setStories(storiesResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <Container className="mt-4">
      <h1>Welcome to Tuinue Wasichana</h1>
      <p>Support girls' empowerment by donating to our approved charities.</p>

      <h2>Our Charities</h2>
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

      <h2>Beneficiary Stories</h2>
      {stories.length === 0 ? (
        <p>No stories available.</p>
      ) : (
        <ListGroup>
          {stories.map(story => (
            <ListGroup.Item key={story.id}>
              <h5>{story.title} <small>by {story.charity_name}</small></h5>
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
    </Container>
  );
};

export default Home;