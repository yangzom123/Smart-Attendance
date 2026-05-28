const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ─── TUTOR REGISTER ───────────────────────────────────────────────────────────
// POST /api/auth/register/tutor
router.post('/register/tutor', async (req, res) => {
    const { name, id, email, password } = req.body;

    if (!name || !id || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const exists = await pool.query(
            'SELECT id FROM tutors WHERE id = $1 OR email = $2',
            [id, email]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({ message: 'Tutor ID or email already registered' });
        }

        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO tutors (id, name, email, password) VALUES ($1, $2, $3, $4)',
            [id, name, email, hashed]
        );

        res.status(201).json({ message: 'Registered Successfully!' });

    } catch (err) {
        console.error('Register tutor error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── TUTOR LOGIN ──────────────────────────────────────────────────────────────
// POST /api/auth/login/tutor
router.post('/login/tutor', async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ message: 'Enter tutor ID and password' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM tutors WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const tutor = result.rows[0];
        const match = await bcrypt.compare(password, tutor.password);

        if (!match) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign(
            { id: tutor.id, role: 'tutor' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, name: tutor.name, id: tutor.id });

    } catch (err) {
        console.error('Login tutor error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── STUDENT REGISTER ────────────────────────────────────────────────────────
// POST /api/auth/register/student
router.post('/register/student', async (req, res) => {
    const { name, id, email, password } = req.body;

    if (!name || !id || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const exists = await pool.query(
            'SELECT id FROM students WHERE id = $1 OR email = $2',
            [id, email]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({ message: 'Student ID or email already registered' });
        }

        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO students (id, name, email, password) VALUES ($1, $2, $3, $4)',
            [id, name, email, hashed]
        );

        res.status(201).json({ message: 'Registered Successfully!' });

    } catch (err) {
        console.error('Register student error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── STUDENT LOGIN ────────────────────────────────────────────────────────────
// POST /api/auth/login/student
router.post('/login/student', async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ message: 'Enter student ID and password' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM students WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const student = result.rows[0];
        const match = await bcrypt.compare(password, student.password);

        if (!match) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign(
            { id: student.id, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, name: student.name, id: student.id });

    } catch (err) {
        console.error('Login student error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
