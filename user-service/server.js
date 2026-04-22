require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/user.routes');
const pool = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

const init = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY, -- matches auth service user id
                name VARCHAR(255) DEFAULT '',
                bio TEXT DEFAULT '',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database tables verified/created.');

        app.get('/health', (req, res) => res.status(200).json({ status: 'User Service OK' }));

        app.use('/users', userRoutes);

        app.listen(PORT, () => {
            console.log(`User Service running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    }
};

init();
