const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

// ─── GET ALL MODULES (for logged-in tutor) ────────────────────────────────────
// GET /api/modules
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM modules WHERE tutor_id = $1 ORDER BY created_at ASC',
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Get modules error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── CREATE A MODULE ─────────────────────────────────────────────────────────
// POST /api/modules
router.post('/', auth, async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Enter module name' });
    }

    try {
        // Check if this tutor already has a module with the same name
        const exists = await pool.query(
            'SELECT id FROM modules WHERE tutor_id = $1 AND LOWER(name) = LOWER($2)',
            [req.user.id, name.trim()]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({ message: 'Module already exists' });
        }

        const result = await pool.query(
            'INSERT INTO modules (name, tutor_id) VALUES ($1, $2) RETURNING id, name',
            [name.trim(), req.user.id]
        );

        res.status(201).json({
            message: 'Module Created Successfully',
            module: result.rows[0]
        });

    } catch (err) {
        console.error('Create module error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
