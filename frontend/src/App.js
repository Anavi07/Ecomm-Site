import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AuthDemo from './components/AuthDemo';
import { AuthProvider } from './context/AuthContext';
import { setAuthToken, getAuthToken } from './services/api';
import './App.css';

function AppContent() {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Initialize auth token from localStorage on app load
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const handleAddToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setCartCount(cart.length + 1);
  };

  return (
    <BrowserRouter>
      <Navbar cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail onAddToCart={handleAddToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} setCart={setCart} setCartCount={setCartCount} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth-demo" element={<AuthDemo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
