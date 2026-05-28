-- Smart Attendance System — Database Schema
-- Run this file in pgAdmin or psql after creating the database:
--   CREATE DATABASE smart_attendance;

-- ─── TUTORS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutors (
    id          VARCHAR(50)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── STUDENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
    id          VARCHAR(50)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── MODULES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modules (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    tutor_id    VARCHAR(50)  REFERENCES tutors(id) ON DELETE CASCADE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── ENROLLED STUDENTS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrolled_students (
    id          SERIAL      PRIMARY KEY,
    student_id  VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    module_id   INT         REFERENCES modules(id)  ON DELETE CASCADE,
    UNIQUE (student_id, module_id)
);

-- ─── ATTENDANCE SESSIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id          SERIAL      PRIMARY KEY,
    module_id   INT         REFERENCES modules(id) ON DELETE CASCADE,
    tutor_id    VARCHAR(50) REFERENCES tutors(id)  ON DELETE CASCADE,
    date        DATE        NOT NULL,
    time        TIME        NOT NULL,
    active      BOOLEAN     DEFAULT true,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ─── ATTENDANCE RECORDS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_records (
    id          SERIAL      PRIMARY KEY,
    session_id  INT         REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_id  VARCHAR(50) REFERENCES students(id)            ON DELETE CASCADE,
    marked_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, student_id)
);
