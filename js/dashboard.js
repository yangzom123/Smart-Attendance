const loggedInUser = JSON.parse(localStorage.getItem("loggedInStudent"));

if (!loggedInUser) {
    window.location.href = "home.html";
}

const BASE_URL = "http://localhost:5000";

const welcomeText = document.getElementById("welcomeText");
const studentName = document.getElementById("studentName");
const enrollForm = document.getElementById("enrollForm");
const courseName = document.getElementById("courseName");
const enrollMessage = document.getElementById("enrollMessage");
const moduleList = document.getElementById("moduleList");
const attendanceTableBody = document.getElementById("attendanceTableBody");
const scanButton = document.getElementById("scanButton");
const scanMessage = document.getElementById("scanMessage");
const warningBox = document.getElementById("warningBox");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const logoutBtn = document.getElementById("logoutBtn");

if (loggedInUser) {
    welcomeText.textContent = `Welcome Back, ${loggedInUser.name}!`;
    studentName.textContent = loggedInUser.name;
}

// In-memory state — loaded from API on each refresh
let myModules = [];
let attendanceRecords = [];
let html5QrcodeScanner = null;
let isScanning = false;

// Attach the token to every API request
function getAuthHeader() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

// ─── DISPLAY FUNCTIONS (same logic as before) ────────────────────────────────

function displayModules() {
    moduleList.textContent = "";

    myModules.forEach((module) => {
        const div = document.createElement("div");
        div.classList.add("module-item");
        div.textContent = module.name;
        moduleList.appendChild(div);
    });
}

function displayAttendance(records) {
    attendanceTableBody.textContent = "";

    records.forEach((record) => {
        const row = document.createElement("tr");

        const subjectTd = document.createElement("td");
        subjectTd.textContent = record.subject;

        const dateTd = document.createElement("td");
        dateTd.textContent = new Date(record.date).toLocaleDateString();

        const statusTd = document.createElement("td");
        statusTd.textContent = record.status;
        statusTd.classList.add(record.status.toLowerCase());

        row.appendChild(subjectTd);
        row.appendChild(dateTd);
        row.appendChild(statusTd);
        attendanceTableBody.appendChild(row);
    });
}

function updateStatistics() {
    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter(
        (record) => record.status === "Present"
    ).length;

    let percentage = 0;

    if (totalClasses > 0) {
        percentage = (attendedClasses / totalClasses) * 100;
    }

    const allowedAbsences = Math.max(
        totalClasses - Math.ceil(totalClasses * 0.9),
        0
    );

    document.getElementById("totalClasses").textContent = totalClasses;
    document.getElementById("attendedClasses").textContent = attendedClasses;
    document.getElementById("attendancePercentage").textContent =
        percentage.toFixed(0) + "%";
    document.getElementById("progressText").textContent =
        percentage.toFixed(0) + "%";
    document.getElementById("allowedAbsences").textContent = allowedAbsences;

    warningBox.style.display =
        percentage < 90 && totalClasses > 0 ? "block" : "none";
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
        const [modulesRes, recordsRes] = await Promise.all([
            fetch(`${BASE_URL}/api/enroll/my-modules`, { headers: getAuthHeader() }),
            fetch(`${BASE_URL}/api/attendance/records/my`, { headers: getAuthHeader() })
        ]);

        myModules = await modulesRes.json();
        attendanceRecords = await recordsRes.json();

        displayModules();
        displayAttendance(attendanceRecords);
        updateStatistics();

    } catch (err) {
        console.error("Failed to load dashboard data:", err);
    }
}

// ─── ENROLL IN MODULE (student self-enrolls) ──────────────────────────────────

enrollForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const moduleName = courseName.value.trim();

    if (moduleName === "") {
        enrollMessage.textContent = "Enter module name";
        enrollMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/enroll`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify({ moduleName })
        });

        const data = await response.json();

        if (!response.ok) {
            enrollMessage.textContent = data.message;
            enrollMessage.style.color = "red";
            return;
        }

        enrollMessage.textContent = "Module Enrolled Successfully";
        enrollMessage.style.color = "lightgreen";
        enrollForm.reset();
        await loadDashboardData();

    } catch (err) {
        enrollMessage.textContent = "Server error. Try again.";
        enrollMessage.style.color = "red";
    }
});

// ─── SCAN QR / MARK ATTENDANCE ────────────────────────────────────────────────

async function onScanSuccess(decodedText) {
    await html5QrcodeScanner.clear();
    isScanning = false;
    scanButton.disabled = false;
    scanButton.textContent = "Start QR Scanner";

    if (!decodedText.startsWith("attendance:")) {
        scanMessage.textContent = "Invalid QR code — not an attendance code";
        scanMessage.style.color = "red";
        return;
    }

    const sessionId = parseInt(decodedText.split(":")[1], 10);

    try {
        const response = await fetch(`${BASE_URL}/api/attendance/scan`, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        if (!response.ok) {
            scanMessage.textContent = data.message;
            scanMessage.style.color = "red";
            return;
        }

        scanMessage.textContent = "Attendance marked successfully!";
        scanMessage.style.color = "lightgreen";
        await loadDashboardData();

    } catch (err) {
        scanMessage.textContent = "Server error. Try again.";
        scanMessage.style.color = "red";
    }
}

scanButton.addEventListener("click", () => {
    if (isScanning) return;

    isScanning = true;
    scanMessage.textContent = "";
    scanButton.disabled = true;
    scanButton.textContent = "Scanner Active...";

    html5QrcodeScanner = new Html5QrcodeScanner(
        "qrReader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
    );

    html5QrcodeScanner.render(onScanSuccess, () => {});
});

// ─── SEARCH & FILTER (works on in-memory records — no API call needed) ────────

searchInput.addEventListener("keyup", () => {
    const value = searchInput.value.toLowerCase();
    const filtered = attendanceRecords.filter((record) =>
        record.subject.toLowerCase().includes(value)
    );
    displayAttendance(filtered);
});

filterSelect.addEventListener("change", () => {
    const value = filterSelect.value;

    if (value === "all") {
        displayAttendance(attendanceRecords);
        return;
    }

    const filtered = attendanceRecords.filter(
        (record) => record.status.toLowerCase() === value
    );
    displayAttendance(filtered);
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInStudent");
    window.location.href = "home.html";
});

// ─── INIT ─────────────────────────────────────────────────────────────────────

clearPlaceholders();
loadDashboardData();
setInterval(() => { if (!isScanning) loadDashboardData(); }, 10000);
