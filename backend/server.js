const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend HTML/CSS/JS files from the project root
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/modules',    require('./routes/modules'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/enroll',     require('./routes/enroll'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
