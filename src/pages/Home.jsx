import SEO from '../components/common/SEO'
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import Features from '../components/home/Features';
import TestimonialSection from '../components/home/TestimonialSection';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Newsletter from '../components/common/Newsletter';

const Home = () => {
  return (
    <>
      <SEO
        title="Leading Software Development and AI automation Company in Kenya"
        description="Expert web development, mobile apps, and digital solutions. Transform your business with cutting-edge technology and innovative design."
        keywords="web development, mobile apps, software development, digital solutions, technology consulting"
        url="/"
      />
    <main>
      <Hero />
      <Services />
      <Features />
      <TestimonialSection />
      
      {/* Call to Action Section */}
      <section className="cta-section py-5 bg-primary text-white text-center">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h2 className="mb-3">Ready to Start Your Project?</h2>
              <p className="mb-4">
                Contact us today to discuss how we can help bring your ideas to life.
              </p>
              <Link to="/contact">
                <Button variant="light" size="lg">
                  Get in Touch
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </section>
      <div className="divider my-5">
      <Newsletter />
      </div>
    </main>
    </>
  );
};

export default Home;