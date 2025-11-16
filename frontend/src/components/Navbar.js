import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth } from '../services/api';
import './Navbar.css';

export default function Navbar({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setOpen(false);
    navigate('/');
  };

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
            {user ? (
              <>
                <span style={{ padding: '8px 16px', fontSize: '14px' }}>
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={({isActive}) => isActive ? 'active' : ''}>Login</NavLink>
                <NavLink to="/register" className={({isActive}) => isActive ? 'active' : ''}>Register</NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
