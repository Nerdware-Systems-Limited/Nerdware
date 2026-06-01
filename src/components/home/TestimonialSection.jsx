import { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Testimonial from '../common/Testimonial';
import {
  fetchTestimonials,
  selectAllTestimonials,
  selectTestimonialsStatus,
  selectTestimonialsError,
} from '../../redux/slices/testimonialSlice';

const TestimonialSection = () => {
  const dispatch     = useDispatch();
  const testimonials = useSelector(selectAllTestimonials);
  const status       = useSelector(selectTestimonialsStatus);
  const error        = useSelector(selectTestimonialsError);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchTestimonials());
  }, [dispatch, status]);

  return (
    <section className="testimonials-section py-5">
      <Container>
        <Row className="justify-content-center text-center mb-5">
          <Col lg={8}>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-description">
              Don't just take our word for it. See what our clients have to say about working with us.
            </p>
          </Col>
        </Row>

        {status === 'loading' && (
          <Row className="justify-content-center">
            <Col xs="auto">
              <p className="text-muted">Loading testimonials…</p>
            </Col>
          </Row>
        )}

        {status === 'failed' && (
          <Row className="justify-content-center">
            <Col xs="auto">
              <p className="text-danger">{error || 'Failed to load testimonials.'}</p>
            </Col>
          </Row>
        )}

        {status === 'succeeded' && testimonials.length === 0 && (
          <Row className="justify-content-center">
            <Col xs="auto">
              <p className="text-muted">No testimonials yet.</p>
            </Col>
          </Row>
        )}

        {status === 'succeeded' && testimonials.length > 0 && (
          <Row>
            {testimonials.map((testimonial) => (
              <Col key={testimonial.id} md={6} lg={3} className="mb-4">
                <Testimonial testimonial={testimonial} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </section>
  );
};

export default TestimonialSection;