import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-dark text-white py-5">
      <Container>
        <Row className="gy-4 justify-content-between text-center text-md-start">
          
          {/* Company Info */}
          <Col xs={12} md={6} lg={4}>
            <h4 className="text-white mb-3">
              Nerdware Systems Limited.
            </h4>

            <p className="mb-2">
              Pushing Technologies to the Limits
            </p>

            <p className="mb-0">
              Our vision is to translate knowledge into innovative
              applications that will have significant societal and
              economic impacts.
            </p>
          </Col>

          {/* Quick Links */}
          <Col xs={6} md={3} lg={3} className="d-none d-md-block">
            <h5 className="text-white mb-3">Quick Links</h5>

            <ul className="list-unstyled footer-links">
              <li className="mb-2">
                <Link
                  to="/"
                  className="text-light text-decoration-none"
                >
                  Home
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/about"
                  className="text-light text-decoration-none"
                >
                  About Us
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/services"
                  className="text-light text-decoration-none"
                >
                  Services
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/portfolio"
                  className="text-light text-decoration-none"
                >
                  Portfolio
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  to="/blog"
                  className="text-light text-decoration-none"
                >
                  Blogs
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="text-light text-decoration-none"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </Col>

          {/* Social */}
          <Col xs={12} md={3} lg={3}>
            <h5 className="text-white mb-3">
              Connect With Us
            </h5>

            <div className="d-flex justify-content-center justify-content-md-start gap-3 mb-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaFacebookF className="text-light" size={20} />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaTwitter className="text-light" size={20} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaLinkedinIn className="text-light" size={20} />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <FaInstagram className="text-light" size={20} />
              </a>
            </div>

            <Link
              to="/contact"
              className="btn btn-outline-light"
            >
              Contact Us
            </Link>
          </Col>
        </Row>

        <hr className="my-4 bg-secondary" />

        <Row>
          <Col className="text-center">
            <p className="mb-0">
              © Copyright {currentYear}. Nerdware Systems Inc.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;