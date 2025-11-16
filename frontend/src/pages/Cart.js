import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';

export default function Cart({ cart = [], setCart, setCartCount }) {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  }, [cart]);

  const updateQuantity = (id, qty) => {
    const next = cart.map((c) => (c._id === id ? { ...c, quantity: Math.max(1, qty) } : c));
    setCart(next);
    setCartCount(next.reduce((s, i) => s + i.quantity, 0));
  };

  const removeItem = (id) => {
    const next = cart.filter((c) => c._id !== id);
    setCart(next);
    setCartCount(next.reduce((s, i) => s + i.quantity, 0));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return navigate('/login');

    if (!cart || cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderItems = cart.map((item) => ({ product: item._id, quantity: item.quantity }));
      const shippingAddress = { address, city, postalCode, country };
      const orderData = {
        userId: user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
      };

      const res = await orderAPI.createOrder(orderData);
      if (res?.data?.success) {
        // Clear cart
        setCart([]);
        setCartCount(0);
        setLoading(false);
        navigate('/');
      } else {
        setError(res?.data?.message || 'Failed to create order');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Order error');
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: '20px auto', padding: '0 16px' }}>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cart.map((item) => (
              <li key={item._id} style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>{item.name}</div>
                <div style={{ width: 120 }}>${item.price?.toFixed(2)}</div>
                <div>
                  <button onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}>-</button>
                  <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}>+</button>
                </div>
                <div>
                  <button onClick={() => removeItem(item._id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 20 }}>
            <h3>Checkout</h3>
            <form onSubmit={handleCheckout}>
              <div style={{ marginBottom: 8 }}>
                <input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required style={{ width: '100%', padding: 8 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required style={{ flex: 1, padding: 8 }} />
                <input placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required style={{ width: 140, padding: 8 }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required style={{ width: '100%', padding: 8 }} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>Payment</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ marginLeft: 8 }}>
                  <option value="cash-on-delivery">Cash on delivery</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Total: ${totalPrice.toFixed(2)}</strong>
              </div>
              {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
              <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
                {loading ? 'Placing order…' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
