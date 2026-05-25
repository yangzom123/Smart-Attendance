const loggedInUser =
    JSON.parse(localStorage.getItem("loggedInStudent"));

if (!loggedInUser) {
    window.location.href = "home.html";
}

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

let tutorModules =
    JSON.parse(localStorage.getItem("tutorModules")) || [];

let enrolledStudents =
    JSON.parse(localStorage.getItem("enrolledStudents")) || [];

let attendanceSessions =
    JSON.parse(localStorage.getItem("attendanceSessions")) || [];

let attendanceRecords =
    JSON.parse(localStorage.getItem("attendanceRecords")) || [];

function normalize(value) {
    return value.trim().toLowerCase();
}

function saveEnrolledStudents() {
    localStorage.setItem(
        "enrolledStudents",
        JSON.stringify(enrolledStudents)
    );
}

function saveAttendanceRecords() {
    localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(attendanceRecords)
    );
}

function getMyModules() {
    return enrolledStudents
        .filter((student) => student.id === loggedInUser.id)
        .map((student) => student.module);
}

function getMyAttendanceRecords() {
    return attendanceRecords.filter(
        (record) => record.studentId === loggedInUser.id
    );
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

function displayModules() {
    moduleList.textContent = "";

    getMyModules().forEach((module) => {
        const div = document.createElement("div");
        div.classList.add("module-item");
        div.textContent = module;
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
        dateTd.textContent = record.date;

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
    const myRecords = getMyAttendanceRecords();
    const totalClasses = myRecords.length;
    const attendedClasses = myRecords.filter(
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
    document.getElementById("attendedClasses").textContent =
        attendedClasses;
    document.getElementById("attendancePercentage").textContent =
        percentage.toFixed(0) + "%";
    document.getElementById("progressText").textContent =
        percentage.toFixed(0) + "%";
    document.getElementById("allowedAbsences").textContent =
        allowedAbsences;

    warningBox.style.display =
        percentage < 90 && totalClasses > 0 ? "block" : "none";
}

function refreshDashboard() {
    tutorModules =
        JSON.parse(localStorage.getItem("tutorModules")) || [];
    enrolledStudents =
        JSON.parse(localStorage.getItem("enrolledStudents")) || [];
    attendanceSessions =
        JSON.parse(localStorage.getItem("attendanceSessions")) || [];
    attendanceRecords =
        JSON.parse(localStorage.getItem("attendanceRecords")) || [];

    const myRecords = getMyAttendanceRecords();

    displayModules();
    displayAttendance(myRecords);
    updateStatistics();
}

enrollForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const moduleName = courseName.value.trim();

    if (moduleName === "") {
        enrollMessage.textContent = "Enter module name";
        enrollMessage.style.color = "red";
        return;
    }

    const moduleExists = tutorModules.some(
        (module) => normalize(module) === normalize(moduleName)
    );

    if (!moduleExists) {
        enrollMessage.textContent = "This module has not been created by tutor";
        enrollMessage.style.color = "red";
        return;
    }

    const alreadyEnrolled = enrolledStudents.some(
        (student) =>
            student.id === loggedInUser.id &&
            normalize(student.module) === normalize(moduleName)
    );

    if (alreadyEnrolled) {
        enrollMessage.textContent = "Already enrolled in this module";
        enrollMessage.style.color = "red";
        return;
    }

    enrolledStudents.push({
        name: loggedInUser.name,
        id: loggedInUser.id,
        module: moduleName
    });

    saveEnrolledStudents();
    displayModules();

    enrollMessage.textContent = "Module Enrolled Successfully";
    enrollMessage.style.color = "lightgreen";

    enrollForm.reset();
});

scanButton.addEventListener("click", () => {
    refreshDashboard();

    const activeSession = attendanceSessions.find(
        (session) => session.active
    );

    if (!activeSession) {
        scanMessage.textContent = "No active attendance session";
        scanMessage.style.color = "red";
        return;
    }

    const isEnrolled = getMyModules().some(
        (module) => normalize(module) === normalize(activeSession.module)
    );

    if (!isEnrolled) {
        scanMessage.textContent =
            `You are not enrolled in ${activeSession.module}`;
        scanMessage.style.color = "red";
        return;
    }

    const alreadyMarked = attendanceRecords.some(
        (record) =>
            record.studentId === loggedInUser.id &&
            record.sessionId === activeSession.id
    );

    if (alreadyMarked) {
        scanMessage.textContent = "Attendance already marked for this session";
        scanMessage.style.color = "red";
        return;
    }

    attendanceRecords.push({
        sessionId: activeSession.id,
        studentId: loggedInUser.id,
        studentName: loggedInUser.name,
        subject: activeSession.module,
        date: activeSession.date,
        time: activeSession.time,
        status: "Present"
    });

    saveAttendanceRecords();
    refreshDashboard();

    scanMessage.textContent =
        `Attendance Marked For ${activeSession.module}`;
    scanMessage.style.color = "lightgreen";
});

searchInput.addEventListener("keyup", () => {
    const value = searchInput.value.toLowerCase();
    const filtered = getMyAttendanceRecords().filter((record) =>
        record.subject.toLowerCase().includes(value)
    );

    displayAttendance(filtered);
});

filterSelect.addEventListener("change", () => {
    const value = filterSelect.value;
    const myRecords = getMyAttendanceRecords();

    if (value === "all") {
        displayAttendance(myRecords);
        return;
    }

    const filtered = myRecords.filter(
        (record) => record.status.toLowerCase() === value
    );

    displayAttendance(filtered);
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInStudent");
    window.location.href = "home.html";
});

clearPlaceholders();
refreshDashboard();