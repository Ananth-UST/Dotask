const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Gateway attaches x-user-id header but let's assume service might want its own verification or just trust the gateway.
// In this architecture, Gateway validates JWT and sends x-user-id.
// The prompt says "Must call auth-service to validate token", so we will add a local middleware for that just in case it's called directly bypassing Gateway, or use the header if gateway handles it. Let's do explicit validation as requested "Must call auth-service to validate token".

const axios = require('axios');

const validateTokenMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    try {
        const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/validate`, {
            headers: { Authorization: authHeader }
        });
        req.user = response.data.user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

router.use(validateTokenMiddleware);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);

module.exports = router;
