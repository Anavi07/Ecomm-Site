import React from 'react';
import { useCart } from '../context/CartContext';
import './CartButton.css';

const CartButton = ({ product, className = '', children, ...props }) => {
  const { addToCart, updateQuantity, removeFromCart, getItemQuantity, isItemInCart } = useCart();
  
  const quantity = getItemQuantity(product._id);
  const inCart = isItemInCart(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product._id, quantity + 1);
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(product._id, quantity - 1);
    } else {
      removeFromCart(product._id);
    }
  };

  if (inCart) {
    return (
      <div className={`cart-button-group ${className}`} {...props}>
        <button className="cart-btn cart-btn-decrement" onClick={handleDecrement}>
          -
        </button>
        <span className="cart-quantity">{quantity}</span>
        <button className="cart-btn cart-btn-increment" onClick={handleIncrement}>
          +
        </button>
      </div>
    );
  }

  return (
    <button 
      className={`cart-btn cart-btn-add ${className}`}
      onClick={handleAddToCart}
      {...props}
    >
      {children || 'Add to Cart'}
    </button>
  );
};

export default CartButton;