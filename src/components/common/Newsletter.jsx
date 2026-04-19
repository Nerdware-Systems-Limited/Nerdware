import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import {
  subscribeNewsletter,
  selectNewsletterStatus,
  selectNewsletterError,
  clearNewsletterState,
} from '../../redux/slices/miscSlice';

const Newsletter = ({
  title = "Stay in the Loop",
  description = "Get the latest articles delivered straight to your inbox.",
}) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');

  const status = useSelector(selectNewsletterStatus);
  const error = useSelector(selectNewsletterError);

  const handleSubmit = () => {
    if (!email) return;
    dispatch(subscribeNewsletter(email));
  };

  // Reset state after success (optional UX)
  useEffect(() => {
    if (status === 'succeeded') {
      setEmail('');
      setTimeout(() => {
        dispatch(clearNewsletterState());
      }, 3000);
    }
  }, [status, dispatch]);

  return (
    <Row className="mt-5">
      <Col lg={8} className="mx-auto">
        <div className="newsletter-signup text-center p-5 rounded-3">
          <h3 className="mb-2">{title}</h3>
          <p className="mb-4">{description}</p>

          <div className="d-flex justify-content-center">
            <div className="input-group" style={{ maxWidth: '420px' }}>
              <input
                type="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </div>

          {/* Feedback UI */}
          {status === 'succeeded' && (
            <p className="text-success mt-3">
              ✅ Subscribed successfully!
            </p>
          )}

          {status === 'failed' && (
            <p className="text-danger mt-3">
              ❌ {error || 'Subscription failed'}
            </p>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default Newsletter;