const loggedInTutor = JSON.parse(localStorage.getItem("loggedInTutor"));

if (!loggedInTutor) {
    window.location.href = "home.html";
}

const BASE_URL = "http://localhost:5000";

const welcomeText = document.getElementById("welcomeText");
const tutorName = document.getElementById("tutorName");
const moduleForm = document.getElementById("moduleForm");
const moduleName = document.getElementById("moduleName");
const moduleMessage = document.getElementById("moduleMessage");
const moduleList = document.getElementById("moduleList");
const generateQrBtn = document.getElementById("generateQrBtn");
const qrText = document.getElementById("qrText");
const reportTableBody = document.getElementById("reportTableBody");
const attendanceForm = document.getElementById("attendanceForm");
const attendanceModule = document.getElementById("attendanceModule");
const attendanceTime = document.getElementById("attendanceTime");
const attendanceMessage = document.getElementById("attendanceMessage");
const logoutBtn = document.getElementById("logoutBtn");
const studentForm = document.getElementById("studentForm");
const studentFullName = document.getElementById("studentFullName");
const studentId = document.getElementById("studentId");
const studentModule = document.getElementById("studentModule");
const studentMessage = document.getElementById("studentMessage");
const studentTableBody = document.getElementById("studentTableBody");

if (loggedInTutor) {
    welcomeText.textContent = `Welcome Back, ${loggedInTutor.name}!`;
    tutorName.textContent = loggedInTutor.name;
}

// In-memory state — loaded from API on each refresh
let tutorModules = [];
let attendanceSessions = [];
let enrolledStudents = [];
let attendanceRecords = [];
let qrCodeInstance = null;

// Attach the token to every API request
function getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function normalize(value) {
    return value.trim().toLowerCase();
}

// ─── DISPLAY FUNCTIONS (same logic as before) ────────────────────────────────

function displayModules() {
    moduleList.textContent = "";

    tutorModules.forEach((module) => {
        const div = document.createElement("div");
        div.classList.add("module-item");
        div.textContent = module.name;
        moduleList.appendChild(div);
    });

    document.getElementById("totalModules").textContent = tutorModules.length;
}

function displayStudents() {
    studentTableBody.textContent = "";

    enrolledStudents.forEach((student) => {
        const row = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = student.name;

        const idTd = document.createElement("td");
        idTd.textContent = student.student_id;

        const moduleTd = document.createElement("td");
        moduleTd.textContent = student.module_name;

        row.appendChild(nameTd);
        row.appendChild(idTd);
        row.appendChild(moduleTd);
        studentTableBody.appendChild(row);
    });

    document.getElementById("totalStudents").textContent =
        enrolledStudents.length;
}

function displayReports() {
    reportTableBody.textContent = "";

    attendanceSessions.forEach((session) => {
        const presentCount = attendanceRecords.filter(
            (record) => record.session_id === session.id
        ).length;

        const row = document.createElement("tr");

        const moduleTd = document.createElement("td");
        moduleTd.textContent = session.module_name;

        const dateTd = document.createElement("td");
        dateTd.textContent = new Date(session.date).toLocaleDateString();

        const timeTd = document.createElement("td");
        timeTd.textContent = `${session.time} (${session.active ? "Active" : "Closed"}, ${presentCount} present)`;

        row.appendChild(moduleTd);
        row.appendChild(dateTd);
        row.appendChild(timeTd);
        reportTableBody.appendChild(row);
    });

    document.getElementById("totalSessions").textContent =
        attendanceSessions.length;
}

function clearPlaceholders() {
    const inputs = document.querySelectorAll("input");

    inputs.forEach((input) => {
        input.addEventListener("focus", () => {
            input.setAttribute("data-placeholder", input.placeholder);
            input.placeholder = "";
        });

        input.addEventListener("blur", () => {
            if (input.value === "") {
                input.placeholder =
                    input.getAttribute("data-placeholder") || "";
            }
        });
    });
}

// ─── LOAD ALL DATA FROM API ───────────────────────────────────────────────────

async function loadDashboardData() {
    try {
        const [modulesRes, sessionsRes, studentsRes, recordsRes] =
            await Promise.all([
                fetch(`${BASE_URL}/api/modules`, { headers: getAuthHeader() }),
                fetch(`${BASE_URL}/api/attendance/sessions`, { headers: getAuthHeader() }),
                fetch(`${BASE_URL}/api/students/enrolled`, { headers: getAuthHeader() }),
                fetch(`${BASE_URL}/api/attendance/records`, { headers: getAuthHeader() })
            ]);

        tutorModules = await modulesRes.json();
        attendanceSessions = await sessionsRes.json();
        enrolledStudents = await studentsRes.json();
        attendanceRecords = await recordsRes.json();

        displayModules();
        displayStudents();
        displayReports();

        const activeSession = attendanceSessions.find(s => s.active);
        document.getElementById("qrCount").textContent = activeSession ? activeSession.module_name : "None";

    } catch (err) {
        console.error("Failed to load dashboard data:", err);
    }
}

// ─── CREATE MODULE ────────────────────────────────────────────────────────────

moduleForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const module = moduleName.value.trim();

    if (module === "") {
        moduleMessage.textContent = "Enter module name";
        moduleMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/modules`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify({ name: module })
        });

        const data = await response.json();

        if (!response.ok) {
            moduleMessage.textContent = data.message;
            moduleMessage.style.color = "red";
            return;
        }

        moduleMessage.textContent = "Module Created Successfully";
        moduleMessage.style.color = "lightgreen";
        moduleForm.reset();
        await loadDashboardData();

    } catch (err) {
        moduleMessage.textContent = "Server error. Try again.";
        moduleMessage.style.color = "red";
    }
});

// ─── ENROLL STUDENT (tutor adds a student to a module) ───────────────────────

studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = studentFullName.value.trim();
    const id = studentId.value.trim();
    const module = studentModule.value.trim();

    if (name === "" || id === "" || module === "") {
        studentMessage.textContent = "Fill all fields";
        studentMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/students/enroll`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify({ name, studentId: id, module })
        });

        const data = await response.json();

        if (!response.ok) {
            studentMessage.textContent = data.message;
            studentMessage.style.color = "red";
            return;
        }

        studentMessage.textContent = "Student Added Successfully";
        studentMessage.style.color = "lightgreen";
        studentForm.reset();
        await loadDashboardData();

    } catch (err) {
        studentMessage.textContent = "Server error. Try again.";
        studentMessage.style.color = "red";
    }
});

// ─── GENERATE QR ─────────────────────────────────────────────────────────────

generateQrBtn.addEventListener("click", () => {
    const activeSession = attendanceSessions.find(s => s.active);

    if (!activeSession) {
        qrText.textContent = "Start an attendance session first";
        qrText.style.color = "red";
        return;
    }

    const canvas = document.getElementById("qrCodeCanvas");
    canvas.innerHTML = "";

    if (qrCodeInstance) {
        qrCodeInstance.clear();
    }

    qrCodeInstance = new QRCode(canvas, {
        text: `attendance:${activeSession.id}`,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    qrText.textContent = `QR active for ${activeSession.module_name}`;
    qrText.style.color = "lightgreen";
});

// ─── START ATTENDANCE SESSION ─────────────────────────────────────────────────

attendanceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const module = attendanceModule.value.trim();
    const time = attendanceTime.value;

    if (module === "" || time === "") {
        attendanceMessage.textContent = "Fill all fields";
        attendanceMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/attendance/sessions`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify({ module, time })
        });

        const data = await response.json();

        if (!response.ok) {
            attendanceMessage.textContent = data.message;
            attendanceMessage.style.color = "red";
            return;
        }

        attendanceMessage.textContent = "Attendance Session Started";
        attendanceMessage.style.color = "lightgreen";
        attendanceForm.reset();
        await loadDashboardData();

    } catch (err) {
        attendanceMessage.textContent = "Server error. Try again.";
        attendanceMessage.style.color = "red";
    }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInTutor");
    window.location.href = "home.html";
});

// ─── INIT ─────────────────────────────────────────────────────────────────────

clearPlaceholders();
loadDashboardData();
setInterval(loadDashboardData, 10000);
