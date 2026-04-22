require('dotenv').config();
const express = require('express');
const cors = require('cors');
const taskRoutes = require('./src/routes/task.routes');
const pool = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

const init = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT DEFAULT '',
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database tables verified/created.');

        app.get('/health', (req, res) => res.status(200).json({ status: 'Task Service OK' }));

        app.use('/tasks', taskRoutes);

        app.listen(PORT, () => {
            console.log(`Task Service running on port ${PORT}`);
        });

    } catch (err) {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    }
};

init();
