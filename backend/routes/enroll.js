const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

// ─── GET MY ENROLLED MODULES (for logged-in student) ─────────────────────────
// GET /api/enroll/my-modules
router.get('/my-modules', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.id, m.name
             FROM enrolled_students es
             JOIN modules m ON es.module_id = m.id
             WHERE es.student_id = $1
             ORDER BY m.name`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Get my modules error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── STUDENT SELF-ENROLLS IN A MODULE ────────────────────────────────────────
// POST /api/enroll
router.post('/', auth, async (req, res) => {
    const { moduleName } = req.body;

    if (!moduleName || moduleName.trim() === '') {
        return res.status(400).json({ message: 'Enter module name' });
    }

    try {
        // Check if the module exists (any tutor can have created it)
        const moduleResult = await pool.query(
            'SELECT id FROM modules WHERE LOWER(name) = LOWER($1)',
            [moduleName.trim()]
        );

        if (moduleResult.rows.length === 0) {
            return res.status(400).json({ message: 'This module has not been created by a tutor' });
        }

        const moduleId = moduleResult.rows[0].id;

        // Check the student actually exists in the database
        // (catches stale localStorage sessions from before the backend was set up)
        const studentCheck = await pool.query(
            'SELECT id FROM students WHERE id = $1',
            [req.user.id]
        );

        if (studentCheck.rows.length === 0) {
            return res.status(401).json({
                message: 'Your account was not found. Please log out, register again, and log back in.'
            });
        }

        // Check if already enrolled
        const alreadyEnrolled = await pool.query(
            'SELECT id FROM enrolled_students WHERE student_id = $1 AND module_id = $2',
            [req.user.id, moduleId]
        );

        if (alreadyEnrolled.rows.length > 0) {
            return res.status(400).json({ message: 'Already enrolled in this module' });
        }

        await pool.query(
            'INSERT INTO enrolled_students (student_id, module_id) VALUES ($1, $2)',
            [req.user.id, moduleId]
        );

        res.status(201).json({ message: 'Module Enrolled Successfully' });

    } catch (err) {
        console.error('Self-enroll error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
