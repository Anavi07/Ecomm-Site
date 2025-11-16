import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="order-success-container">
      <div className="order-success-content">
        <div className="success-icon">
          ✓
        </div>
        
        <h1>Order Placed Successfully!</h1>
        
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>
        
        <div className="order-details">
          <h3>What happens next?</h3>
          <ul>
            <li>You will receive an order confirmation email shortly</li>
            <li>Your order will be processed within 1-2 business days</li>
            <li>You'll get a tracking number once your order ships</li>
            <li>Delivery typically takes 3-7 business days</li>
          </ul>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/products')}
          >
            View Products
          </button>
        </div>
        
        <p className="redirect-notice">
          You will be redirected to the home page in 10 seconds...
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;