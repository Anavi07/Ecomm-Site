import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const body = await res.json();
        if (mounted) setProducts(body.data || []);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => { mounted = false; };
  }, [API_BASE]);

  return (
    <main className="products-page">
      <div className="container">
        <h2>Products</h2>

        {loading && <p className="muted">Loading products...</p>}
        {error && <p className="error">Error: {error}</p>}

        {!loading && !error && (
          <div className="products-grid">
            {products.length === 0 && <p className="muted">No products found.</p>}
            {products.map((p) => (
              <article className="product-card" key={p._id}>
                <Link to={`/products/${p._id}`} className="image-wrap">
                  <img
                    src={(p.images && p.images[0]) || '/placeholder.png'}
                    alt={p.name}
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                </Link>
                <div className="product-body">
                  <h3 className="product-title">
                    <Link to={`/products/${p._id}`}>{p.name}</Link>
                  </h3>
                  <p className="product-category">{p.category}</p>
                  <div className="product-meta">
                    <span className="price">₹{p.price}</span>
                    <span className="rating">⭐ {p.ratings ? p.ratings.toFixed(1) : '0.0'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
