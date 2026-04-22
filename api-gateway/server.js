require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'Gateway OK' }));

// Auth Service proxy configuration - unauthenticated
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
      '^/api/auth': '/auth',
  },
}));

// Auth Middleware for protected proxies
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    try {
        // Validate token with auth-service
        const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/validate`, {
            headers: { Authorization: authHeader }
        });
        // Attach user info to headers so downstream services can consume it
        req.headers['x-user-id'] = response.data.user.id;
        req.headers['x-user-role'] = response.data.user.role;
        next();
    } catch (err) {
        console.error('JWT Validation Error:', err.message);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

// User Service proxy configuration - protected
app.use('/api/users', verifyToken, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/users': '/users',
    },
}));

// Task Service proxy configuration - protected
app.use('/api/tasks', verifyToken, createProxyMiddleware({
    target: process.env.TASK_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/tasks': '/tasks',
    },
}));

app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
