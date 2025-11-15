import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="brand">
          <NavLink to="/" className="brand-link">E-Commerce</NavLink>
        </div>

        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          <span className="hamburger" />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? 'active' : ''}>Products</NavLink>
          <NavLink to="/cart" className={({isActive}) => isActive ? 'active cart-link' : 'cart-link'}>
            Cart <span className="cart-badge">{cartCount}</span>
          </NavLink>
          <div className="auth-links">
            <NavLink to="/login" className={({isActive}) => isActive ? 'active' : ''}>Login</NavLink>
            <NavLink to="/register" className={({isActive}) => isActive ? 'active' : ''}>Register</NavLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
