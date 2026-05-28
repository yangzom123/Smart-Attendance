const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

// ─── GET ALL SESSIONS (for logged-in tutor) ───────────────────────────────────
// GET /api/attendance/sessions
router.get('/sessions', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT sess.id, m.name AS module_name, sess.date, sess.time, sess.active
             FROM attendance_sessions sess
             JOIN modules m ON sess.module_id = m.id
             WHERE sess.tutor_id = $1
             ORDER BY sess.created_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Get sessions error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── START A NEW ATTENDANCE SESSION ──────────────────────────────────────────
// POST /api/attendance/sessions
router.post('/sessions', auth, async (req, res) => {
    const { module, time } = req.body;

    if (!module || !time) {
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

        // Close all previously active sessions for this tutor
        await pool.query(
            'UPDATE attendance_sessions SET active = false WHERE tutor_id = $1',
            [req.user.id]
        );

        // Start the new session
        await pool.query(
            `INSERT INTO attendance_sessions (module_id, tutor_id, date, time, active)
             VALUES ($1, $2, CURRENT_DATE, $3, true)`,
            [moduleId, req.user.id, time]
        );

        res.status(201).json({ message: 'Attendance Session Started' });

    } catch (err) {
        console.error('Start session error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET ACTIVE SESSION (for students checking in) ───────────────────────────
// GET /api/attendance/sessions/active
router.get('/sessions/active', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT sess.id, m.name AS module_name, sess.date, sess.time
             FROM attendance_sessions sess
             JOIN modules m ON sess.module_id = m.id
             WHERE sess.active = true
             LIMIT 1`
        );

        if (result.rows.length === 0) {
            return res.json({ session: null });
        }

        res.json({ session: result.rows[0] });

    } catch (err) {
        console.error('Get active session error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET ALL ATTENDANCE RECORDS (for tutor reports) ──────────────────────────
// GET /api/attendance/records
router.get('/records', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ar.id, ar.session_id, ar.student_id, ar.marked_at
             FROM attendance_records ar
             JOIN attendance_sessions sess ON ar.session_id = sess.id
             WHERE sess.tutor_id = $1
             ORDER BY ar.marked_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Get records error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── GET MY ATTENDANCE RECORDS (for a student) ───────────────────────────────
// GET /api/attendance/records/my
router.get('/records/my', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ar.id, m.name AS subject, sess.date, 'Present' AS status
             FROM attendance_records ar
             JOIN attendance_sessions sess ON ar.session_id = sess.id
             JOIN modules m               ON sess.module_id = m.id
             WHERE ar.student_id = $1
             ORDER BY ar.marked_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Get my records error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── STUDENT SCANS QR / MARKS ATTENDANCE ─────────────────────────────────────
// POST /api/attendance/scan
router.post('/scan', auth, async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }

    try {
        // Confirm the session is still active and get its module
        const sessionResult = await pool.query(
            `SELECT sess.id, sess.module_id, m.name AS module_name
             FROM attendance_sessions sess
             JOIN modules m ON sess.module_id = m.id
             WHERE sess.id = $1 AND sess.active = true`,
            [sessionId]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(400).json({ message: 'No active attendance session' });
        }

        const session = sessionResult.rows[0];

        // Check the student is enrolled in that module
        const enrolledResult = await pool.query(
            'SELECT id FROM enrolled_students WHERE student_id = $1 AND module_id = $2',
            [req.user.id, session.module_id]
        );

        if (enrolledResult.rows.length === 0) {
            return res.status(400).json({
                message: `You are not enrolled in ${session.module_name}`
            });
        }

        // Check if already marked for this session
        const alreadyMarked = await pool.query(
            'SELECT id FROM attendance_records WHERE session_id = $1 AND student_id = $2',
            [sessionId, req.user.id]
        );

        if (alreadyMarked.rows.length > 0) {
            return res.status(400).json({ message: 'Attendance already marked for this session' });
        }

        // Mark attendance
        await pool.query(
            'INSERT INTO attendance_records (session_id, student_id) VALUES ($1, $2)',
            [sessionId, req.user.id]
        );

        res.status(201).json({ message: 'Attendance marked successfully' });

    } catch (err) {
        console.error('Scan attendance error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
