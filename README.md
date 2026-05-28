# Smart Attendance Tracker System

**CTE204 Web App Development | Mini Project | Royal University of Bhutan**  
> Full-stack attendance management using dynamic QR codes, role-based access, and a RESTful backend.

---

## What It Does

A web application that replaces manual roll calls with QR-code-based attendance marking.

**Tutors** create class sessions and display a QR code. **Students** scan that QR code with their device camera to mark themselves present. All records are saved in a PostgreSQL database and accessible instantly.

---

## Features

- **Role-based login** — separate register/login flows for tutors and students
- **JWT authentication** — stateless, token-based auth on every protected route
- **Dynamic QR codes** — each session generates a unique QR encoding the session ID
- **Camera-based QR scanning** — works directly in the browser, no app required
- **Enrollment system** — tutors add students to modules; students can also self-enroll
- **Auto-syncing dashboards** — both dashboards refresh every 10 seconds automatically
- **Student attendance history** — students view their full attendance record across all modules
- **Backend validation** — prevents duplicate scans, invalid session IDs, and unenrolled students

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express.js |
| Database | PostgreSQL (`pg` package) |
| Authentication | JWT (`jsonwebtoken`) + Password hashing (`bcryptjs`) |
| QR Generation | QRCode.js (CDN) |
| QR Scanning | html5-qrcode (CDN) |
| Config | dotenv |

---

## Project Structure

```
smart-attendance-system/
│
├── backend/
│   ├── server.js                 # Entry point — starts server, mounts routes
│   ├── .env                      # Environment variables (not committed to Git)
│   ├── .env.example              # Template for environment variables
│   ├── database.sql              # PostgreSQL schema — run once to create tables
│   ├── config/
│   │   └── db.js                 # PostgreSQL connection pool
│   ├── middleware/
│   │   └── authMiddleware.js     # Verifies JWT on protected routes
│   └── routes/
│       ├── auth.js               # Register & login for tutor and student
│       ├── modules.js            # Create and fetch modules
│       ├── students.js           # Tutor adds students to modules
│       ├── enroll.js             # Student self-enrollment
│       └── attendance.js         # Sessions, QR scan, attendance records
│
├── js/
│   ├── script.js                 # Home page logic
│   ├── tutor-login.js            # Tutor login
│   ├── tutor-dashboard.js        # Tutor dashboard — modules, students, QR, sessions
│   ├── student-login.js          # Student login
│   ├── student-register.js       # Student registration
│   └── dashboard.js              # Student dashboard — enroll, scan QR, records
│
├── css/
│   ├── style.css                 # Home page styles
│   ├── login.css                 # Login/register page styles
│   ├── register.css              # Register page styles
│   ├── dashboard.css             # Student dashboard styles
│   └── tutor-dashboard.css       # Tutor dashboard styles
│
├── home.html                     # Landing page
├── tutor-login.html              # Tutor login page
├── student-login.html            # Student login page
├── student-register.html         # Student registration page
├── tutor-dashboard.html          # Tutor dashboard
└── student-dashboard.html        # Student dashboard
```

---

## Database Schema

```
tutors ──────────────── modules ──────────────── attendance_sessions
                           │                            │
                    enrolled_students            attendance_records
                           │                            │
                        students ───────────────────────┘
```

**Tables:** `tutors`, `students`, `modules`, `enrolled_students`, `attendance_sessions`, `attendance_records`

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register/tutor` | Register tutor | None |
| POST | `/api/auth/login/tutor` | Tutor login → JWT | None |
| POST | `/api/auth/register/student` | Register student | None |
| POST | `/api/auth/login/student` | Student login → JWT | None |
| GET | `/api/modules` | List tutor's modules | Tutor JWT |
| POST | `/api/modules` | Create module | Tutor JWT |
| GET | `/api/students/enrolled` | List students in tutor's modules | Tutor JWT |
| POST | `/api/students/enroll` | Tutor adds student to module | Tutor JWT |
| GET | `/api/enroll/my-modules` | List student's enrolled modules | Student JWT |
| POST | `/api/enroll` | Student self-enrolls in module | Student JWT |
| GET | `/api/attendance/sessions` | List tutor's sessions | Tutor JWT |
| POST | `/api/attendance/sessions` | Start attendance session | Tutor JWT |
| GET | `/api/attendance/sessions/active` | Get current active session | None |
| GET | `/api/attendance/records` | All records for tutor's sessions | Tutor JWT |
| GET | `/api/attendance/records/my` | Student's attendance history | Student JWT |
| POST | `/api/attendance/scan` | Student scans QR → marks present | Student JWT |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL (running locally)

### 1. Clone the repository

```bash
git clone https://github.com/yangzom123/Smart-Attendance.git
cd Smart-Attendance
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Set up the database

Create a PostgreSQL database then load the schema:

```bash
# In psql or pgAdmin query tool
CREATE DATABASE smart_attendance;

# Then run the schema
psql -U postgres -d smart_attendance -f backend/database.sql
```

### 4. Configure environment variables

Create a `.env` file inside `backend/` (use `.env.example` as a template):

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_attendance
DB_USER=postgres
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
```

### 5. Start the server

```bash
cd backend
npm run dev      # development (nodemon, auto-restart)
# or
npm start        # production
```

### 6. Open the app

Open your browser and go to:

```
http://localhost:5000/home.html
```

Or open `home.html` with Live Server in VS Code.

---

## How It Works

### Attendance Flow

```
Tutor starts session
      ↓
Backend creates session record (active = true)
      ↓
Tutor clicks "Generate QR"
      ↓
QRCode.js encodes "attendance:<sessionId>" into a QR image
      ↓
Student clicks "Start QR Scanner" → camera opens (html5-qrcode)
      ↓
Student scans QR → JS reads "attendance:42" → extracts sessionId
      ↓
POST /api/attendance/scan { sessionId: 42 }
      ↓
Backend checks: session active? student enrolled? already marked?
      ↓
Attendance record saved → student marked present
```

### Authentication Flow

1. User submits login form → JS sends `POST /api/auth/login/tutor` or `/student`
2. Backend verifies password with `bcryptjs` → returns signed JWT
3. JS stores JWT in `localStorage`
4. Every API call includes `Authorization: Bearer <token>` header
5. `authMiddleware.js` verifies token → attaches user to `req.user`

---

## Academic Integrity

This is an individual academic project submitted for CTE204 at the Royal University of Bhutan. All code is original work. External libraries are credited in the Tech Stack section above.

---

## License

For academic submission purposes only.
