import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CartButton from '../components/CartButton';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const body = await res.json();
        if (mounted) setProduct(body.data);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProduct();
    return () => { mounted = false; };
  }, [id, API_BASE]);

  if (loading) return <main style={{maxWidth:900, margin:'20px auto', padding:'0 16px'}}><p>Loading...</p></main>;
  if (error) return <main style={{maxWidth:900, margin:'20px auto', padding:'0 16px'}}><p style={{color:'#b00020'}}>Error: {error}</p></main>;
  if (!product) return <main style={{maxWidth:900, margin:'20px auto', padding:'0 16px'}}><p>Product not found</p></main>;

  return (
    <main style={{maxWidth:900, margin:'20px auto', padding:'0 16px'}}>
      <button onClick={() => navigate(-1)} style={{marginBottom:'16px', padding:'8px 12px', cursor:'pointer'}}>← Back</button>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'32px', marginTop:'20px'}}>
        <div>
          <img
            src={(product.images && product.images[0]) || '/placeholder.png'}
            alt={product.name}
            style={{width:'100%', maxHeight:'500px', objectFit:'cover', borderRadius:'6px'}}
          />
        </div>
        <div>
          <h1 style={{marginTop:0}}>{product.name}</h1>
          <p style={{color:'#666', marginBottom:'16px'}}>{product.category}</p>
          <p style={{fontSize:'28px', fontWeight:'bold', color:'#0a7f3e', marginBottom:'8px'}}>₹{product.price}</p>
          <p style={{fontSize:'14px', color:'#ff9800'}}>⭐ {product.ratings ? product.ratings.toFixed(1) : '0.0'} ({product.reviews ? product.reviews.length : 0} reviews)</p>
          <p style={{margin:'16px 0', lineHeight:'1.6'}}>{product.description}</p>
          <p style={{marginBottom:'16px'}}><strong>Stock: </strong>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
          <CartButton 
            product={product}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </CartButton>
          {product.reviews && product.reviews.length > 0 && (
            <div style={{marginTop:'32px', borderTop:'1px solid #e6e6e6', paddingTop:'16px'}}>
              <h3>Reviews</h3>
              {product.reviews.map((rev, idx) => (
                <div key={idx} style={{marginBottom:'12px', paddingBottom:'12px', borderBottom:'1px solid #f0f0f0'}}>
                  <p style={{margin:'0 0 4px 0', fontWeight:'600'}}>{rev.user} - ⭐ {rev.rating}</p>
                  <p style={{margin:0, color:'#666'}}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
