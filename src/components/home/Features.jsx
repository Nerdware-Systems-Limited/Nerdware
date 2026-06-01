import { Container, Row, Col } from 'react-bootstrap';
import { FaUsers, FaLightbulb, FaCloudDownloadAlt } from 'react-icons/fa';

const features = [
  {
    id: 1,
    title: 'Client-Centric Approach',
    description: 'We focus on client satisfaction and deeply understanding your needs to deliver solutions that truly fit.',
    icon: <FaUsers className="service-icon" size={24} />,
  },
  {
    id: 2,
    title: 'Innovation',
    description: 'We emphasize new ideas and custom solutions, staying ahead of the curve to meet your specific goals.',
    icon: <FaLightbulb className="service-icon" size={24} />,
  },
  {
    id: 3,
    title: 'Cloud Kids Mashinani',
    description: 'Our flagship initiative creating societal impact through technology — empowering communities from the ground up.',
    icon: <FaCloudDownloadAlt className="service-icon" size={24} />,
  },
];

const Features = () => {
  return (
    <section className="features-section">
      <Container>
        {/* Section header */}
        <Row className="justify-content-center text-center mb-5">
          <Col lg={7}>
            <div className="section-badge mb-3">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  display: 'inline-block',
                  marginRight: '0.375rem',
                }}
              />
              Why Choose Us
            </div>
            <h2 className="section-title">
              Built on{' '}
              <span className="text-gradient">principles that matter</span>
            </h2>
            <p className="section-description mb-0">
              At Nerdware System Technologies, we're committed to excellence in everything we do.
            </p>
          </Col>
        </Row>

        {/* Feature cards */}
        <Row className="g-4">
          {features.map((feature) => (
            <Col key={feature.id} md={4}>
              <div className="feature-item h-100">
                <div className="icon-wrapper d-flex justify-content-center align-items-center mb-3">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description mb-0">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Features;