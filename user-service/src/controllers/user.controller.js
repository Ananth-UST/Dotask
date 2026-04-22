const pool = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        let result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

        // If profile doesn't exist yet, we create an empty one
        if (result.rows.length === 0) {
            result = await pool.query(
                'INSERT INTO users (id, name, bio) VALUES ($1, $2, $3) RETURNING *',
                [userId, '', '']
            );
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, bio } = req.body;

        const result = await pool.query(
            `INSERT INTO users (id, name, bio) 
             VALUES ($1, $2, $3)
             ON CONFLICT (id) 
             DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, name || '', bio || '']
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
