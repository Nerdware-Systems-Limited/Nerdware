import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import hero from '../../assets/tech_illustration.webp';

const Hero = () => {
  return (
    <section className="hero-section text-white">
      <Container>
        <Row className="align-items-center flex-column-reverse flex-lg-row text-center text-lg-start">
          
          {/* TEXT CONTENT */}
          <Col lg={7} className="hero-content">
            <h1 className="display-5 fw-bold mb-3">
              Pushing Technologies to the Limits
            </h1>

            <p className="lead mb-4">
              Our vision is to translate knowledge into innovative applications
              that will have significant societal and economic impacts.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <Link to="/services">
                <Button variant="primary" size="lg" className="hero-btn w-100 w-sm-auto">
                  Our Services
                </Button>
              </Link>

              <Link to="/contact">
                <Button variant="outline-light" size="lg" className="hero-btn w-100 w-sm-auto">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </Col>

          {/* IMAGE */}
          <Col lg={5} className="text-center mb-4 mb-lg-0">
            <img
              src={hero}
              alt="Technology Illustration"
              className="img-fluid hero-image"
            />
          </Col>

        </Row>
      </Container>
    </section>
  );
};

export default Hero;