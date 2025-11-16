# Deployment Guide - Environment Variables

## Overview

This guide explains where and how to set environment variables for deploying your MERN e-commerce application.

---

## 🔴 Backend Environment Variables

### Where to Set:
**Option 1: Local `.env` file (for local development)**
- Location: `backend/.env`
- Create this file in the `backend` folder
- **Never commit this file to Git** (it's in `.gitignore`)

**Option 2: Hosting Platform (for production)**
- Set in your hosting platform's environment variable settings
- Examples: Heroku, Railway, Render, Vercel, AWS, etc.

### Required Variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Security Secrets (generate strong random strings)
JWT_SECRET=your-very-long-random-secret-key-here
SESSION_SECRET=another-very-long-random-secret-key-here
COOKIE_SECRET=yet-another-very-long-random-secret-key-here

# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

### How to Generate Strong Secrets:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

**Online:** Use a password generator to create 32+ character random strings

---

## 🔵 Frontend Environment Variables

### ⚠️ IMPORTANT: React Environment Variables

React apps need environment variables **at BUILD TIME**, not runtime!

### What is `REACT_APP_API_URL`?

This is the URL where your **backend API** is hosted. The frontend uses this to make API calls.

**Examples:**
- Development: `http://localhost:5000`
- Production: `https://api.yourdomain.com` or `https://your-backend.herokuapp.com`

### Where to Set:

**Option 1: `.env` file in frontend folder (for local development)**
- Location: `frontend/.env`
- Create this file in the `frontend` folder

**Option 2: Build-time environment variable (for production)**
- Set when running `npm run build`
- Or set in your hosting platform's build settings

### Required Variable:

```bash
REACT_APP_API_URL=https://your-backend-api-url.com
```

**Note:** All React env vars must start with `REACT_APP_` to be accessible in the code!

---

## 📋 Step-by-Step Deployment

### Step 1: Set Backend Environment Variables

#### For Local Development:
1. Create `backend/.env` file:
```bash
cd backend
touch .env  # or create manually
```

2. Add all required variables:
```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-here
SESSION_SECRET=your-secret-here
COOKIE_SECRET=your-secret-here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

#### For Production (Hosting Platform):
1. Go to your hosting platform's dashboard
2. Find "Environment Variables" or "Config Vars" section
3. Add each variable one by one:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = generated secret
   - `SESSION_SECRET` = generated secret
   - `COOKIE_SECRET` = generated secret
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (or your platform's port)
   - `FRONTEND_URL` = your frontend URL

---

### Step 2: Build Frontend with Environment Variable

#### For Local Build:
1. Create `frontend/.env` file:
```bash
cd frontend
touch .env  # or create manually
```

2. Add the API URL:
```bash
REACT_APP_API_URL=http://localhost:5000
```

3. Build the frontend:
```bash
npm run build
```

#### For Production Build:

**Method 1: Using .env file**
1. Create `frontend/.env.production`:
```bash
REACT_APP_API_URL=https://your-backend-api-url.com
```

2. Build:
```bash
npm run build
```

**Method 2: Inline during build (Linux/Mac)**
```bash
REACT_APP_API_URL=https://your-backend-api-url.com npm run build
```

**Method 3: Inline during build (Windows PowerShell)**
```powershell
$env:REACT_APP_API_URL="https://your-backend-api-url.com"; npm run build
```

**Method 4: Hosting Platform Settings**
- Most platforms (Vercel, Netlify) let you set env vars in their dashboard
- They automatically use them during build

---

### Step 3: Deploy Backend

1. Push your code to GitHub
2. Connect your hosting platform to GitHub
3. Set all environment variables in platform dashboard
4. Deploy!

**Popular Backend Hosting:**
- **Heroku**: Set in "Settings" → "Config Vars"
- **Railway**: Set in "Variables" tab
- **Render**: Set in "Environment" section
- **Vercel**: Set in "Settings" → "Environment Variables"

---

### Step 4: Deploy Frontend

1. Build the frontend with `REACT_APP_API_URL` set
2. Deploy the `build` folder

**Popular Frontend Hosting:**
- **Vercel**: Automatically builds, set env vars in dashboard
- **Netlify**: Set env vars in "Site settings" → "Environment variables"
- **GitHub Pages**: Build locally, deploy `build` folder
- **AWS S3 + CloudFront**: Upload `build` folder contents

---

## 🎯 Example Deployment Scenarios

### Scenario 1: Backend on Heroku, Frontend on Vercel

**Backend (Heroku):**
1. Set env vars in Heroku dashboard:
   - `MONGODB_URI` = your MongoDB Atlas URI
   - `JWT_SECRET` = generated secret
   - `SESSION_SECRET` = generated secret
   - `COOKIE_SECRET` = generated secret
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://your-app.vercel.app`

**Frontend (Vercel):**
1. Set env var in Vercel dashboard:
   - `REACT_APP_API_URL` = `https://your-backend.herokuapp.com`
2. Vercel automatically builds with this variable

---

### Scenario 2: Both on Railway

**Backend Service:**
- Set all backend env vars in Railway dashboard
- Set `FRONTEND_URL` = your frontend Railway URL

**Frontend Service:**
- Set `REACT_APP_API_URL` = your backend Railway URL
- Railway builds with this variable automatically

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] Backend `.env` has all required variables (or set in hosting platform)
- [ ] Frontend has `REACT_APP_API_URL` set (or in hosting platform)
- [ ] `FRONTEND_URL` in backend matches your frontend domain
- [ ] `REACT_APP_API_URL` in frontend matches your backend domain
- [ ] All secrets are strong random strings (not default values)
- [ ] `NODE_ENV=production` is set for backend
- [ ] MongoDB Atlas allows connections from your hosting IP (or 0.0.0.0/0 for all)

---

## 🔍 Testing Your Setup

### Test Backend:
```bash
# Start backend
cd backend
npm start

# Should see:
# ✅ MongoDB connected successfully
# Server running on port 5000
```

### Test Frontend:
```bash
# Set env var and start
cd frontend
# Create .env with REACT_APP_API_URL=http://localhost:5000
npm start

# Frontend should connect to backend successfully
```

---

## 🆘 Common Issues

**Issue:** Frontend can't connect to backend
- **Fix:** Check `REACT_APP_API_URL` matches backend URL exactly
- **Fix:** Check CORS settings - `FRONTEND_URL` must match frontend domain

**Issue:** "Environment variable required" error
- **Fix:** Make sure all required vars are set in hosting platform

**Issue:** Build works but API calls fail
- **Fix:** Rebuild frontend after changing `REACT_APP_API_URL`
- **Fix:** Clear browser cache

**Issue:** CORS errors in production
- **Fix:** Set `FRONTEND_URL` in backend to exact frontend domain (with https://)

---

## 📝 Quick Reference

| Variable | Where | When | Example |
|----------|-------|------|---------|
| `MONGODB_URI` | Backend | Always | `mongodb+srv://...` |
| `JWT_SECRET` | Backend | Always | `abc123...` (32+ chars) |
| `SESSION_SECRET` | Backend | Always | `xyz789...` (32+ chars) |
| `COOKIE_SECRET` | Backend | Always | `def456...` (32+ chars) |
| `FRONTEND_URL` | Backend | Always | `https://your-app.com` |
| `REACT_APP_API_URL` | Frontend | Build time | `https://api.your-app.com` |
| `NODE_ENV` | Backend | Production | `production` |

---

## 🎓 Summary

1. **Backend env vars**: Set in `backend/.env` (local) or hosting platform (production)
2. **Frontend env vars**: Set in `frontend/.env` (local) or hosting platform (production)
3. **REACT_APP_API_URL**: This is your backend URL - set it when building frontend
4. **Build frontend**: `npm run build` (with REACT_APP_API_URL set)
5. **Deploy**: Upload backend code and frontend build folder

Need help? Check your hosting platform's documentation for setting environment variables!

