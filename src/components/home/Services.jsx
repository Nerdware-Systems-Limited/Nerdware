import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaLaptopCode, FaMobileAlt, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Web Development',
      description: 'Custom web applications tailored to client needs.',
      icon: <FaLaptopCode className="service-icon" size={40} />,
    },
    {
      id: 2,
      title: 'Mobile Development',
      description: 'Custom mobile apps to help businesses stand out.',
      icon: <FaMobileAlt className="service-icon" size={40} />,
    },
    {
      id: 3,
      title: 'Search Engine Optimization (SEO)',
      description: 'Services to improve search engine rankings and provide a competitive edge.',
      icon: <FaSearch className="service-icon" size={40} />,
    },
  ];

  return (
    <section className="services-section py-5">
      <Container>
        <Row className="justify-content-center text-center mb-5">
          <Col lg={8}>
            <h2 className="section-title">Our Services</h2>
            <p className="section-description">
              We provide top-notch digital solutions to help your business thrive in the digital landscape.
            </p>
          </Col>
        </Row>
        
        <Row>
          {services.map((service) => (
            <Col key={service.id} md={4} className="mb-4">
              <Card className="service-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="icon-wrapper d-flex justify-content-center align-items-center mb-3">
                    {service.icon}
                  </div>
                  <Card.Title as="h3" className="service-title">{service.title}</Card.Title>
                  <Card.Text className="service-description">
                    {service.description}
                  </Card.Text>
                  <Link to="/services" className="btn btn-link text-decoration-none">
                    Learn More →
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Services;