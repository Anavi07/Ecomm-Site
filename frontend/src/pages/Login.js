import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, setAuthToken } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await userAPI.login(email, password);
      if (res?.data?.success) {
        // Save token and user to localStorage
        const { token, data } = res.data;
        if (token) {
          setAuthToken(token); // Store token in localStorage and set axios header
        }
        localStorage.setItem('user', JSON.stringify(data));
        setLoading(false);
        navigate('/');
      } else {
        setError(res?.data?.message || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login error');
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '40px auto', padding: '0 16px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </main>
  );
}
