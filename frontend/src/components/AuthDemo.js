import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuthDemo.css';

const API_BASE = 'http://localhost:5000/api';

const AuthDemo = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [authStates, setAuthStates] = useState({
    session: { authenticated: false, user: null, loading: false, responseTime: null },
    jwt: { authenticated: false, user: null, loading: false, responseTime: null, tokens: null },
    cookie: { authenticated: false, user: null, loading: false, responseTime: null }
  });
  
  const [logs, setLogs] = useState([]);

  // Add log entry
  const addLog = (method, action, result, timing = null) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      method,
      action,
      result,
      timing: timing ? `${timing}ms` : null
    };
    setLogs(prev => [logEntry, ...prev].slice(0, 20)); // Keep only last 20 logs
  };

  // Session Authentication
  const sessionLogin = async () => {
    setAuthStates(prev => ({ ...prev, session: { ...prev.session, loading: true } }));
    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        `${API_BASE}/auth/session/login`,
        credentials,
        { withCredentials: true }
      );
      
      const responseTime = Date.now() - startTime;
      
      if (response.data.success) {
        setAuthStates(prev => ({
          ...prev,
          session: {
            authenticated: true,
            user: response.data.data,
            loading: false,
            responseTime
          }
        }));
        addLog('Session', 'Login', 'Success', responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setAuthStates(prev => ({ ...prev, session: { ...prev.session, loading: false, responseTime } }));
      addLog('Session', 'Login', `Error: ${error.response?.data?.message}`, responseTime);
    }
  };

  const sessionLogout = async () => {
    const startTime = Date.now();
    
    try {
      await axios.post(`${API_BASE}/auth/session/logout`, {}, { withCredentials: true });
      const responseTime = Date.now() - startTime;
      
      setAuthStates(prev => ({
        ...prev,
        session: { authenticated: false, user: null, loading: false, responseTime }
      }));
      addLog('Session', 'Logout', 'Success', responseTime);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      addLog('Session', 'Logout', `Error: ${error.message}`, responseTime);
    }
  };

  // JWT Authentication
  const jwtLogin = async () => {
    setAuthStates(prev => ({ ...prev, jwt: { ...prev.jwt, loading: true } }));
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${API_BASE}/auth/jwt/login`, credentials);
      const responseTime = Date.now() - startTime;
      
      if (response.data.success) {
        const { accessToken, refreshToken, data } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        setAuthStates(prev => ({
          ...prev,
          jwt: {
            authenticated: true,
            user: data,
            loading: false,
            responseTime,
            tokens: { accessToken, refreshToken }
          }
        }));
        addLog('JWT', 'Login', 'Success', responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setAuthStates(prev => ({ ...prev, jwt: { ...prev.jwt, loading: false, responseTime } }));
      addLog('JWT', 'Login', `Error: ${error.response?.data?.message}`, responseTime);
    }
  };

  const jwtLogout = async () => {
    const startTime = Date.now();
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await axios.post(`${API_BASE}/auth/jwt/logout`, { refreshToken });
      const responseTime = Date.now() - startTime;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setAuthStates(prev => ({
        ...prev,
        jwt: { authenticated: false, user: null, loading: false, responseTime, tokens: null }
      }));
      addLog('JWT', 'Logout', 'Success', responseTime);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      addLog('JWT', 'Logout', `Error: ${error.message}`, responseTime);
    }
  };

  // Cookie Authentication
  const cookieLogin = async () => {
    setAuthStates(prev => ({ ...prev, cookie: { ...prev.cookie, loading: true } }));
    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        `${API_BASE}/auth/cookie/login`,
        credentials,
        { withCredentials: true }
      );
      
      const responseTime = Date.now() - startTime;
      
      if (response.data.success) {
        setAuthStates(prev => ({
          ...prev,
          cookie: {
            authenticated: true,
            user: response.data.data,
            loading: false,
            responseTime
          }
        }));
        addLog('Cookie', 'Login', 'Success', responseTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      setAuthStates(prev => ({ ...prev, cookie: { ...prev.cookie, loading: false, responseTime } }));
      addLog('Cookie', 'Login', `Error: ${error.response?.data?.message}`, responseTime);
    }
  };

  const cookieLogout = async () => {
    const startTime = Date.now();
    
    try {
      await axios.post(`${API_BASE}/auth/cookie/logout`, {}, { withCredentials: true });
      const responseTime = Date.now() - startTime;
      
      setAuthStates(prev => ({
        ...prev,
        cookie: { authenticated: false, user: null, loading: false, responseTime }
      }));
      addLog('Cookie', 'Logout', 'Success', responseTime);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      addLog('Cookie', 'Logout', `Error: ${error.message}`, responseTime);
    }
  };

  // Check authentication status for all methods
  const checkAllAuthStatus = async () => {
    // Check Session
    try {
      const sessionResponse = await axios.get(`${API_BASE}/auth/session/me`, { withCredentials: true });
      if (sessionResponse.data.success) {
        setAuthStates(prev => ({
          ...prev,
          session: { ...prev.session, authenticated: true, user: sessionResponse.data.data }
        }));
      }
    } catch (error) {
      setAuthStates(prev => ({ ...prev, session: { ...prev.session, authenticated: false, user: null } }));
    }

    // Check JWT
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const jwtResponse = await axios.get(`${API_BASE}/auth/jwt/me`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (jwtResponse.data.success) {
          setAuthStates(prev => ({
            ...prev,
            jwt: { ...prev.jwt, authenticated: true, user: jwtResponse.data.data }
          }));
        }
      } catch (error) {
        setAuthStates(prev => ({ ...prev, jwt: { ...prev.jwt, authenticated: false, user: null } }));
      }
    }

    // Check Cookie
    try {
      const cookieResponse = await axios.get(`${API_BASE}/auth/cookie/me`, { withCredentials: true });
      if (cookieResponse.data.success) {
        setAuthStates(prev => ({
          ...prev,
          cookie: { ...prev.cookie, authenticated: true, user: cookieResponse.data.data }
        }));
      }
    } catch (error) {
      setAuthStates(prev => ({ ...prev, cookie: { ...prev.cookie, authenticated: false, user: null } }));
    }
  };

  // Performance comparison
  const performanceTest = async () => {
    const results = { session: [], jwt: [], cookie: [] };
    
    addLog('Performance', 'Test Started', 'Testing all methods...');
    
    // Test each method 5 times
    for (let i = 0; i < 5; i++) {
      // Test Session
      const sessionStart = Date.now();
      try {
        await axios.get(`${API_BASE}/auth/session/me`, { withCredentials: true });
        results.session.push(Date.now() - sessionStart);
      } catch (error) {
        results.session.push(null);
      }

      // Test JWT
      const jwtStart = Date.now();
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          await axios.get(`${API_BASE}/auth/jwt/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          results.jwt.push(Date.now() - jwtStart);
        } catch (error) {
          results.jwt.push(null);
        }
      }

      // Test Cookie
      const cookieStart = Date.now();
      try {
        await axios.get(`${API_BASE}/auth/cookie/me`, { withCredentials: true });
        results.cookie.push(Date.now() - cookieStart);
      } catch (error) {
        results.cookie.push(null);
      }
    }

    const avgSession = results.session.filter(r => r !== null).reduce((a, b) => a + b, 0) / results.session.filter(r => r !== null).length;
    const avgJWT = results.jwt.filter(r => r !== null).reduce((a, b) => a + b, 0) / results.jwt.filter(r => r !== null).length;
    const avgCookie = results.cookie.filter(r => r !== null).reduce((a, b) => a + b, 0) / results.cookie.filter(r => r !== null).length;

    addLog('Performance', 'Session Avg', `${avgSession.toFixed(2)}ms`);
    addLog('Performance', 'JWT Avg', `${avgJWT.toFixed(2)}ms`);
    addLog('Performance', 'Cookie Avg', `${avgCookie.toFixed(2)}ms`);
  };

  useEffect(() => {
    checkAllAuthStatus();
  }, []);

  return (
    <div className="auth-demo">
      <h1>Authentication Methods Comparison</h1>
      
      {/* Credentials Form */}
      <div className="credentials-form">
        <h3>Test Credentials</h3>
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
        />
      </div>

      {/* Authentication Methods Grid */}
      <div className="auth-methods-grid">
        {/* Session Auth */}
        <div className="auth-method session">
          <h3>Session Authentication</h3>
          <div className="auth-status">
            <span className={`status ${authStates.session.authenticated ? 'authenticated' : 'not-authenticated'}`}>
              {authStates.session.authenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
            {authStates.session.responseTime && (
              <span className="response-time">{authStates.session.responseTime}ms</span>
            )}
          </div>
          
          {authStates.session.user && (
            <div className="user-info">
              <p><strong>User:</strong> {authStates.session.user.email}</p>
              <p><strong>Role:</strong> {authStates.session.user.role}</p>
            </div>
          )}
          
          <div className="auth-actions">
            <button
              onClick={sessionLogin}
              disabled={authStates.session.loading || authStates.session.authenticated}
              className="login-btn"
            >
              {authStates.session.loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              onClick={sessionLogout}
              disabled={!authStates.session.authenticated}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
          
          <div className="method-details">
            <h4>How it works:</h4>
            <ul>
              <li>Server-side session storage</li>
              <li>HTTP-only session cookies</li>
              <li>Session stored in MongoDB</li>
              <li>Automatic CSRF protection</li>
            </ul>
          </div>
        </div>

        {/* JWT Auth */}
        <div className="auth-method jwt">
          <h3>JWT Authentication</h3>
          <div className="auth-status">
            <span className={`status ${authStates.jwt.authenticated ? 'authenticated' : 'not-authenticated'}`}>
              {authStates.jwt.authenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
            {authStates.jwt.responseTime && (
              <span className="response-time">{authStates.jwt.responseTime}ms</span>
            )}
          </div>
          
          {authStates.jwt.user && (
            <div className="user-info">
              <p><strong>User:</strong> {authStates.jwt.user.email}</p>
              <p><strong>Role:</strong> {authStates.jwt.user.role}</p>
            </div>
          )}

          {authStates.jwt.tokens && (
            <div className="token-info">
              <p><strong>Access Token:</strong> {authStates.jwt.tokens.accessToken.substring(0, 20)}...</p>
              <p><strong>Refresh Token:</strong> {authStates.jwt.tokens.refreshToken.substring(0, 20)}...</p>
            </div>
          )}
          
          <div className="auth-actions">
            <button
              onClick={jwtLogin}
              disabled={authStates.jwt.loading || authStates.jwt.authenticated}
              className="login-btn"
            >
              {authStates.jwt.loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              onClick={jwtLogout}
              disabled={!authStates.jwt.authenticated}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
          
          <div className="method-details">
            <h4>How it works:</h4>
            <ul>
              <li>Stateless token authentication</li>
              <li>Access token (15min) + Refresh token (7d)</li>
              <li>Stored in localStorage</li>
              <li>Bearer token in Authorization header</li>
            </ul>
          </div>
        </div>

        {/* Cookie Auth */}
        <div className="auth-method cookie">
          <h3>Cookie-Only Authentication</h3>
          <div className="auth-status">
            <span className={`status ${authStates.cookie.authenticated ? 'authenticated' : 'not-authenticated'}`}>
              {authStates.cookie.authenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
            {authStates.cookie.responseTime && (
              <span className="response-time">{authStates.cookie.responseTime}ms</span>
            )}
          </div>
          
          {authStates.cookie.user && (
            <div className="user-info">
              <p><strong>User:</strong> {authStates.cookie.user.email}</p>
              <p><strong>Role:</strong> {authStates.cookie.user.role}</p>
            </div>
          )}
          
          <div className="auth-actions">
            <button
              onClick={cookieLogin}
              disabled={authStates.cookie.loading || authStates.cookie.authenticated}
              className="login-btn"
            >
              {authStates.cookie.loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              onClick={cookieLogout}
              disabled={!authStates.cookie.authenticated}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
          
          <div className="method-details">
            <h4>How it works:</h4>
            <ul>
              <li>Signed cookies without sessions</li>
              <li>User data stored in cookie</li>
              <li>HTTP-only & signed cookies</li>
              <li>No server-side storage</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Performance Testing */}
      <div className="performance-section">
        <h3>Performance Testing</h3>
        <button onClick={performanceTest} className="performance-btn">
          Run Performance Test
        </button>
      </div>

      {/* Activity Logs */}
      <div className="logs-section">
        <h3>Activity Logs</h3>
        <div className="logs">
          {logs.map((log) => (
            <div key={log.id} className={`log-entry ${log.method.toLowerCase()}`}>
              <span className="log-time">{log.timestamp}</span>
              <span className="log-method">{log.method}</span>
              <span className="log-action">{log.action}</span>
              <span className="log-result">{log.result}</span>
              {log.timing && <span className="log-timing">{log.timing}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-table">
        <h3>Method Comparison</h3>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Session</th>
              <th>JWT</th>
              <th>Cookie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Storage</td>
              <td>Server (MongoDB)</td>
              <td>Client (localStorage)</td>
              <td>Client (Cookie)</td>
            </tr>
            <tr>
              <td>Scalability</td>
              <td>Medium</td>
              <td>High</td>
              <td>Low</td>
            </tr>
            <tr>
              <td>Security</td>
              <td>High</td>
              <td>Medium-High</td>
              <td>Medium</td>
            </tr>
            <tr>
              <td>CSRF Protection</td>
              <td>Built-in</td>
              <td>Manual</td>
              <td>Manual</td>
            </tr>
            <tr>
              <td>XSS Protection</td>
              <td>High (httpOnly)</td>
              <td>Low (localStorage)</td>
              <td>High (httpOnly)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuthDemo;