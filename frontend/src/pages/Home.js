import React from 'react';
import './Home.css';

export default function Home() {
  const featured = [
    { id: 1, name: 'Comfort Sneakers', price: 59 },
    { id: 2, name: 'Classic Watch', price: 129 },
    { id: 3, name: 'Leather Bag', price: 99 },
    { id: 4, name: 'Wireless Earbuds', price: 79 },
  ];

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
        <div className="grid">
          {featured.map(p => (
            <div className="card" key={p.id}>
              <div className="thumb" />
              <h3>{p.name}</h3>
              <p className="price">${p.price}</p>
              <button className="btn">Add to cart</button>
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
