const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at',
            [email, password_hash, role || 'user']
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Sign JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.validateToken = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.replace('Bearer ', '');
        
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(401).json({ error: 'Unauthorized' });
            res.status(200).json({ valid: true, user: decoded });
        });
    } catch (err) {
        console.error('Validation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
