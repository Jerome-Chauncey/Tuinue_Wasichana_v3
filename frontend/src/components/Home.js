import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Container, Alert } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function Home() {
  const [charities, setCharities] = useState([]);
  const [stories, setStories] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch charities
    axios.get(`${API_URL}/charities`)
      .then(res => {
        if (res && Array.isArray(res.data)) {
          setCharities(res.data);
          // Fetch stories for each charity
          const promises = res.data.map(c =>
            axios.get(`${API_URL}/stories?charity_id=${c.id}`)
              .then(storyRes => storyRes.data || [])
              .catch(err => {
                console.error(`Failed to fetch stories for charity ${c.id}:`, err.message);
                return [];
              })
          );
          Promise.all(promises)
            .then(results => setStories(results.flatMap(stories => stories)))
            .catch(err => setError('Failed to fetch stories: ' + (err.response?.data?.message || err.message)));
        } else {
          setError('Invalid or no charity data received');
        }
      })
      .catch(err => {
        setError('Failed to fetch charities: ' + (err.response?.data?.message || err.message));
      });
  }, []);

  const filteredCharities = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Container className="text-center bg-light py-5">
        <h1 className="text-primary">Tuinue Wasichana</h1>
        <p className="lead">
          A donation platform dedicated to empowering girls in sub-Saharan Africa by providing sanitary supplies, clean water, and sanitation facilities to ensure they never miss school due to their periods.
        </p>
        <img
          src="https://via.placeholder.com/800x400?text=Girls+Education"
          alt="Girls Education"
          className="img-fluid rounded my-3"
        />
      </Container>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Control
        type="text"
        placeholder="Search charities..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4"
      />
      <h2 className="text-primary mb-4">Our Charities</h2>
      <div className="row">
        {filteredCharities.length > 0 ? (
          filteredCharities.map(charity => (
            <div key={charity.id} className="col-md-4 mb-4">
              <Card>
                <Card.Img variant="top" src="https://via.placeholder.com/150?text=Charity" />
                <Card.Body>
                  <Card.Title>{charity.name}</Card.Title>
                  <Card.Text>{charity.description}</Card.Text>
                  <Button as={Link} to={`/charity/${charity.id}`} variant="primary">
                    <FaSearch className="me-2" /> View Details
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))
        ) : (
          <p>No charities found.</p>
        )}
      </div>
      <h2 className="text-primary mb-4">Beneficiary Stories</h2>
      <div className="row">
        {stories.length > 0 ? (
          stories.map(story => (
            <div key={story.id} className="col-md-4 mb-4">
              <Card>
                {story.image_url && <Card.Img variant="top" src={story.image_url} />}
                <Card.Body>
                  <Card.Title>{story.title}</Card.Title>
                  <Card.Text>
                    {story.beneficiary_name} ({story.beneficiary_age} years old): {story.content}
                  </Card.Text>
                  <Card.Footer>{new Date(story.date).toLocaleDateString()}</Card.Footer>
                </Card.Body>
              </Card>
            </div>
          ))
        ) : (
          <p>No stories available.</p>
        )}
      </div>
    </div>
  );
}

export default Home;