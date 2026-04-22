const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
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

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
