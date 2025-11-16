import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './Cart.css';

const Cart = () => {
  const {
    items,
    totalItems,
    subtotal,
    discount,
    discountCode,
    shipping,
    tax,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    setShipping,
    validateDiscountCode,
    calculateShipping
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Local state for checkout form
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'cash-on-delivery'
  });

  // Discount code state
  const [discountInput, setDiscountInput] = useState('');
  const [discountError, setDiscountError] = useState('');

  // Order state
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  // Handle discount code application
  const handleApplyDiscount = () => {
    setDiscountError('');
    const discountData = validateDiscountCode(discountInput);
    
    if (discountData) {
      if (discountData.type === 'shipping') {
        setShipping(0);
      } else {
        applyDiscount(discountInput.toUpperCase(), discountData.amount, discountData.type);
      }
      setDiscountInput('');
    } else {
      setDiscountError('Invalid discount code');
    }
  };

  // Calculate and set shipping when proceeding to checkout
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Calculate shipping if not already set
    if (shipping === 0 && !discountCode.includes('FREESHIP')) {
      const shippingCost = calculateShipping(subtotal);
      setShipping(shippingCost);
    }
    
    setShowCheckout(true);
  };

  // Handle checkout form submission
  const handleCheckout = async (e) => {
    e.preventDefault();
    setOrderError('');
    
    if (items.length === 0) {
      setOrderError('Cart is empty');
      return;
    }

    setOrderLoading(true);
    
    try {
      const orderItems = items.map(item => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price
      }));

      const orderData = {
        userId: user._id,
        orderItems,
        shippingAddress: {
          address: checkoutData.address,
          city: checkoutData.city,
          postalCode: checkoutData.postalCode,
          country: checkoutData.country
        },
        paymentMethod: checkoutData.paymentMethod,
        subtotal,
        discount,
        shipping,
        tax,
        totalPrice: total
      };

      const response = await orderAPI.createOrder(orderData);
      
      if (response?.data?.success) {
        clearCart();
        navigate('/order-success');
      } else {
        setOrderError(response?.data?.message || 'Failed to create order');
      }
    } catch (error) {
      setOrderError(error.response?.data?.message || error.message || 'Order failed');
    } finally {
      setOrderLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Your Cart is Empty</h2>
          <p>Add some products to your cart to get started!</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart ({totalItems} items)</h2>
        <button 
          className="btn btn-secondary"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>

      <div className="cart-content">
        {/* Cart Items */}
        <div className="cart-items">
          {items.map(item => (
            <div key={item._id} className="cart-item">
              <div className="item-image">
                <img 
                  src={item.image || item.imageUrl || `https://via.placeholder.com/150x150?text=${encodeURIComponent(item.name)}`} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/150x150?text=${encodeURIComponent(item.name)}`;
                  }}
                />
              </div>
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <p className="item-price">₹{item.price?.toFixed(2)}</p>
              </div>
              
              <div className="item-quantity">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                  className="quantity-input"
                  min="1"
                />
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
              
              <button 
                className="remove-btn"
                onClick={() => removeFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          
          {/* Discount Code Input */}
          <div className="discount-section">
            <div className="discount-input">
              <input
                type="text"
                placeholder="Enter discount code"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                className="discount-field"
              />
              <button 
                className="btn btn-secondary"
                onClick={handleApplyDiscount}
                disabled={!discountInput}
              >
                Apply
              </button>
            </div>
            {discountError && <p className="error-message">{discountError}</p>}
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal ({totalItems} items):</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="price-row discount">
                <span>Discount ({discountCode}):</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            
            {shipping > 0 && (
              <div className="price-row">
                <span>Shipping:</span>
                <span>₹{shipping.toFixed(2)}</span>
              </div>
            )}
            
            <div className="price-row">
              <span>GST (8%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            
            <div className="price-row total">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="cart-actions">
            {!showCheckout ? (
              <button 
                className="btn btn-primary btn-large"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="checkout-form">
                <h4>Shipping Information</h4>
                <form onSubmit={handleCheckout}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={checkoutData.address}
                      onChange={(e) => setCheckoutData({...checkoutData, address: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="City"
                      value={checkoutData.city}
                      onChange={(e) => setCheckoutData({...checkoutData, city: e.target.value})}
                      required
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={checkoutData.postalCode}
                      onChange={(e) => setCheckoutData({...checkoutData, postalCode: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Country"
                      value={checkoutData.country}
                      onChange={(e) => setCheckoutData({...checkoutData, country: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      value={checkoutData.paymentMethod}
                      onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                      className="form-select"
                    >
                      <option value="cash-on-delivery">Cash on Delivery</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  
                  {orderError && <p className="error-message">{orderError}</p>}
                  
                  <div className="checkout-buttons">
                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowCheckout(false)}
                    >
                      Back to Cart
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                      disabled={orderLoading}
                    >
                      {orderLoading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;