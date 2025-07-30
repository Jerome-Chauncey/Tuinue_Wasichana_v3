import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles.css';
import impact from '../assets/impact-image.jpg';

const API_URL = 'http://localhost:5000/api';

const Home = () => {
  const [charities, setCharities] = useState([]);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      try {
        const [charitiesResponse, storiesResponse] = await Promise.all([
          axios.get(`${API_URL}/charities`).catch(err => ({ error: err })),
          axios.get(`${API_URL}/stories`).catch(err => ({ error: err })),
        ]);

        if (charitiesResponse.error) {
          throw new Error(charitiesResponse.error.response?.data?.message || 'Failed to fetch charities');
        }
        if (storiesResponse.error) {
          throw new Error(storiesResponse.error.response?.data?.message || 'Failed to fetch stories');
        }

        setCharities(charitiesResponse.data || []);
        setStories(storiesResponse.data || []);
      } catch (err) {
        const message = err.message || 'Failed to load data';
        setError(message);
        toast.error(message, { position: 'top-right', toastId: 'home-error', autoClose: 5000 });
      }
    };
    fetchData();
  }, []);

  return (
    <Container fluid className="p-0">
      <section className="hero">
        <Row className="g-0">
          <Col md={6} className="hero-text">
            <h1>EMPOWERING GIRLS, TRANSFORMING FUTURES</h1>
            <p className="lead">
              Tuinue Wasichana fights period poverty and educational barriers with reusable menstrual products and health education.
            </p>
            {/* <Button as={Link} to="/donate" className="btn-cta mr-2">
              <i className="fas fa-donate mr-2"></i> Donate Now
            </Button>
            <Button as={Link} to="/about" className="btn-cta" variant="outline-dark">
              <i className="fas fa-book mr-2"></i> Learn More
            </Button> */}
          </Col>
          <Col md={6} className="hero-image" role="img" aria-label="Girls empowered by Tuinue Wasichana"></Col>
        </Row>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4">Our Impact</h2>
          <Row>
            <Col md={4} className="text-center mb-4">
              <i className="fas fa-book fa-3x mb-3" style={{ color: 'var(--accent-teal)' }}></i>
              <h4>10,000+ Girls Educated</h4>
              <p>Delivering menstrual health education to keep girls in school.</p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <i className="fas fa-female fa-3x mb-3" style={{ color: 'var(--accent-coral)' }}></i>
              <h4>50,000+ Pads Distributed</h4>
              <p>Providing reusable sanitary pads to communities in need.</p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <i className="fas fa-users fa-3x mb-3" style={{ color: 'var(--primary-purple)' }}></i>
              <h4>200+ Communities Empowered</h4>
              <p>Partnering with schools and hubs for lasting change.</p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="order-md-2">
              <img
                src={impact}
                alt="Girls with reusable pads"
                className="img-fluid"
                style={{ maxHeight: '600px', objectFit: 'cover', objectPosition: 'top', width: '100%',}}
              />
            </Col>
            <Col md={6} className="order-md-1">
              <h2>Breaking Barriers, Building Dreams</h2>
              <p className="lead">
                By providing sustainable menstrual solutions and education, we ensure girls stay in school every day, unlocking their potential.
              </p>
              <Button as={Link} to="/donate" className="btn-cta">
                <i className="fas fa-users mr-2"></i> Support Our Mission
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      

      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4">Support Our Charities</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {charities.length === 0 ? (
            <p className="text-center">No charities available yet.</p>
          ) : (
            <Row>
              {charities.map(charity => (
                <Col md={4} key={charity.id} className="mb-4">
                  <Card className="h-100 shadow-sm">
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
                      <Card.Text>{charity.description.substring(0, 100)}...</Card.Text>
                      <Button as={Link} to={`/charity/${charity.id}`} className="btn-cta">
                        <i className="fas fa-arrow-right mr-2"></i> View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4">Stories of Change</h2>
          {stories.length === 0 ? (
            <p className="text-center">No stories available yet.</p>
          ) : (
            <Row>
              {stories.slice(0, 3).map(story => (
                <Col md={4} key={story.id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    {story.photo_url && (
                      <Card.Img
                        variant="top"
                        src={story.photo_url}
                        alt={story.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title>{story.title}</Card.Title>
                      <Card.Text>{story.content.substring(0, 100)}...</Card.Text>
                      <p><small>By {story.charity_name} on {new Date(story.date).toLocaleDateString()}</small></p>
                      <Button as={Link} to={`/charity/${story.charity_id}`} className="btn-cta">
                        <i className="fas fa-book mr-2"></i> Read More
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          <div className="text-center mt-4">
            <Button as={Link} to="/stories" className="btn-cta">
              <i className="fas fa-book-open mr-2"></i> See All Stories
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-5 text-center" style={{ backgroundColor: 'var(--primary-pink)' }}>
        <Container>
          <h2>Join the Movement</h2>
          <p>
            Your generosity keeps girls in school and empowers communities. Become a monthly donor today.
          </p>
          <Button as={Link} to="/donate" className="btn-cta">
            <i className="fas fa-donate mr-2"></i> Donate Now
          </Button>
        </Container>
      </section>
    </Container>
  );
};

export default Home;