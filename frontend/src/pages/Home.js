import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home({ onAddToCart }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let mounted = true;
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/products?limit=4`);
        if (!res.ok) throw new Error('Failed to load featured products');
        const body = await res.json();
        if (mounted) setFeatured(body.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFeatured();
    return () => { mounted = false; };
  }, [API_BASE]);

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-inner">
          <h1>Find everything you need for daily life</h1>
          <p>Quality products at unbeatable prices — shipped fast.</p>
          <a className="cta" href="/products">Shop Now</a>
        </div>
      </section>

      <section className="featured">
        <h2>Featured Products</h2>
        {loading && <p className="muted">Loading featured products...</p>}
        <div className="grid">
          {featured.map(p => (
            <div className="card" key={p._id}>
              <Link to={`/products/${p._id}`} className="thumb-link">
                <div className="thumb" style={{
                  backgroundImage: `url(${(p.images && p.images[0]) || '/placeholder.png'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
              </Link>
              <h3>
                <Link to={`/products/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {p.name}
                </Link>
              </h3>
              <p className="price">₹{p.price}</p>
              <button className="btn" onClick={() => onAddToCart && onAddToCart(p)}>Add to cart</button>
            </div>
          ))}
        </div>
      </section>

      <section className="categories">
        <h2>Categories</h2>
        <div className="cats">
          <div className="cat">Clothing</div>
          <div className="cat">Accessories</div>
          <div className="cat">Electronics</div>
          <div className="cat">Home</div>
        </div>
      </section>

      <section className="promo">
        <div className="promo-inner">
          <h3>Limited time: Free shipping on orders over $50</h3>
        </div>
      </section>
    </main>
  );
}
