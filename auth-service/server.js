require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');
const pool = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Main init function
const init = async () => {
    try {
        // Run migrations/table creation
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database tables verified/created.');

        // Health check
        app.get('/health', (req, res) => res.status(200).json({ status: 'Auth Service OK' }));

        // Routes
        app.use('/auth', authRoutes);

        app.listen(PORT, () => {
            console.log(`Auth Service running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    }
};

init();
