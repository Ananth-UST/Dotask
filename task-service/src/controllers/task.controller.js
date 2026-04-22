const pool = require('../config/db');

exports.getTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Get tasks error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, description, status } = req.body;

        if (!title) return res.status(400).json({ error: 'Title is required' });

        const result = await pool.query(
            'INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, title, description || '', status || 'pending']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const { title, description, status } = req.body;

        // Ensure task belongs to user
        const taskCheck = await pool.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        const result = await pool.query(
            'UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [title || taskCheck.rows[0].title, description || taskCheck.rows[0].description, status || taskCheck.rows[0].status, taskId, userId]
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *', [taskId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found or unauthorized' });
        }

        res.status(200).json({ message: 'Task deleted successfully', task: result.rows[0] });
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
