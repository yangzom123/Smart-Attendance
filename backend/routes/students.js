const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

// ─── GET ALL STUDENTS ENROLLED IN TUTOR'S MODULES ────────────────────────────
// GET /api/students/enrolled
router.get('/enrolled', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.name, es.student_id, m.name AS module_name
             FROM enrolled_students es
             JOIN students s ON es.student_id = s.id
             JOIN modules m   ON es.module_id  = m.id
             WHERE m.tutor_id = $1
             ORDER BY m.name, s.name`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Get enrolled students error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── TUTOR ENROLLS A STUDENT INTO A MODULE ────────────────────────────────────
// POST /api/students/enroll
router.post('/enroll', auth, async (req, res) => {
    const { name, studentId, module } = req.body;

    if (!name || !studentId || !module) {
        return res.status(400).json({ message: 'Fill all fields' });
    }

    try {
        // Check the module exists and belongs to this tutor
        const moduleResult = await pool.query(
            'SELECT id FROM modules WHERE LOWER(name) = LOWER($1) AND tutor_id = $2',
            [module.trim(), req.user.id]
        );

        if (moduleResult.rows.length === 0) {
            return res.status(400).json({ message: 'Create this module first' });
        }

        const moduleId = moduleResult.rows[0].id;

        // Check that the student is registered in the system
        const studentResult = await pool.query(
            'SELECT id FROM students WHERE id = $1',
            [studentId]
        );

        if (studentResult.rows.length === 0) {
            return res.status(400).json({ message: 'Student has not registered yet' });
        }

        // Check if already enrolled
        const alreadyEnrolled = await pool.query(
            'SELECT id FROM enrolled_students WHERE student_id = $1 AND module_id = $2',
            [studentId, moduleId]
        );

        if (alreadyEnrolled.rows.length > 0) {
            return res.status(400).json({ message: 'Student already added to this module' });
        }

        await pool.query(
            'INSERT INTO enrolled_students (student_id, module_id) VALUES ($1, $2)',
            [studentId, moduleId]
        );

        res.status(201).json({ message: 'Student Added Successfully' });

    } catch (err) {
        console.error('Enroll student error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
