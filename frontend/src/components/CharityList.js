import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "https://tuinue-wasichana-v3.onrender.com";

const CharityList = () => {
  const [charities, setCharities] = useState([]);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/charities`);
        setCharities(response.data);
      } catch (err) {
        console.error("Failed to fetch charities:", err);
      }
    };
    fetchCharities();
  }, []);

  return (
    <Container className="mt-4">
      <h2>Our Charities</h2>
      {charities.length === 0 ? (
        <p>No charities available.</p>
      ) : (
        <div className="row">
          {charities.map((charity) => (
            <Card key={charity.id} className="col-md-4 mb-4">
              {charity.photo_url && (
                <Card.Img
                  variant="top"
                  src={charity.photo_url}
                  alt={charity.name}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <Card.Body>
                <Card.Title
                  className="card fw-bold"
                  style={{ fontWeight: "bold !important" }}
                >
                  {charity.name}
                </Card.Title>
                <Card.Text>{charity.description}</Card.Text>
                <Link to={`/charity/${charity.id}`}>
                  <Button variant="primary">View Details</Button>
                </Link>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default CharityList;
