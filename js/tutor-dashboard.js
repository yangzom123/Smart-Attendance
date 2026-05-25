const loggedInTutor =
    JSON.parse(localStorage.getItem("loggedInTutor"));

if (!loggedInTutor) {
    window.location.href = "home.html";
}

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

let tutorModules =
    JSON.parse(localStorage.getItem("tutorModules")) || [];

let attendanceSessions =
    JSON.parse(localStorage.getItem("attendanceSessions")) || [];

let enrolledStudents =
    JSON.parse(localStorage.getItem("enrolledStudents")) || [];

let attendanceRecords =
    JSON.parse(localStorage.getItem("attendanceRecords")) || [];

let qrCount =
    Number(localStorage.getItem("qrCount")) || 0;

function saveModules() {
    localStorage.setItem("tutorModules", JSON.stringify(tutorModules));
}

function saveSessions() {
    localStorage.setItem(
        "attendanceSessions",
        JSON.stringify(attendanceSessions)
    );
}

function saveEnrolledStudents() {
    localStorage.setItem(
        "enrolledStudents",
        JSON.stringify(enrolledStudents)
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

function normalize(value) {
    return value.trim().toLowerCase();
}

function displayModules() {
    moduleList.textContent = "";

    tutorModules.forEach((module) => {
        const div = document.createElement("div");
        div.classList.add("module-item");
        div.textContent = module;
        moduleList.appendChild(div);
    });

    document.getElementById("totalModules").textContent =
        tutorModules.length;
}

function displayStudents() {
    studentTableBody.textContent = "";

    enrolledStudents.forEach((student) => {
        const row = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = student.name;

        const idTd = document.createElement("td");
        idTd.textContent = student.id;

        const moduleTd = document.createElement("td");
        moduleTd.textContent = student.module;

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
            (record) => record.sessionId === session.id
        ).length;

        const row = document.createElement("tr");

        const moduleTd = document.createElement("td");
        moduleTd.textContent = session.module;

        const dateTd = document.createElement("td");
        dateTd.textContent = session.date;

        const timeTd = document.createElement("td");
        timeTd.textContent =
            `${session.time} (${session.active ? "Active" : "Closed"}, ${presentCount} present)`;

        row.appendChild(moduleTd);
        row.appendChild(dateTd);
        row.appendChild(timeTd);
        reportTableBody.appendChild(row);
    });

    document.getElementById("totalSessions").textContent =
        attendanceSessions.length;
}

moduleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const module = moduleName.value.trim();

    if (module === "") {
        moduleMessage.textContent = "Enter module name";
        moduleMessage.style.color = "red";
        return;
    }

    const moduleExists = tutorModules.some(
        (item) => normalize(item) === normalize(module)
    );

    if (moduleExists) {
        moduleMessage.textContent = "Module already exists";
        moduleMessage.style.color = "red";
        return;
    }

    tutorModules.push(module);
    saveModules();
    displayModules();

    moduleMessage.textContent = "Module Created Successfully";
    moduleMessage.style.color = "lightgreen";

    moduleForm.reset();
});

studentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = studentFullName.value.trim();
    const id = studentId.value.trim();
    const module = studentModule.value.trim();

    if (name === "" || id === "" || module === "") {
        studentMessage.textContent = "Fill all fields";
        studentMessage.style.color = "red";
        return;
    }

    const moduleExists = tutorModules.some(
        (item) => normalize(item) === normalize(module)
    );

    if (!moduleExists) {
        studentMessage.textContent = "Create this module first";
        studentMessage.style.color = "red";
        return;
    }

    const alreadyEnrolled = enrolledStudents.some(
        (student) =>
            student.id === id &&
            normalize(student.module) === normalize(module)
    );

    if (alreadyEnrolled) {
        studentMessage.textContent = "Student already added to this module";
        studentMessage.style.color = "red";
        return;
    }

    enrolledStudents.push({ name: name, id: id, module: module });
    saveEnrolledStudents();
    displayStudents();

    studentMessage.textContent = "Student Added Successfully";
    studentMessage.style.color = "lightgreen";

    studentForm.reset();
});

generateQrBtn.addEventListener("click", () => {
    const activeSession = attendanceSessions.find(
        (session) => session.active
    );

    if (!activeSession) {
        qrText.textContent = "Start an attendance session first";
        qrText.style.color = "red";
        return;
    }

    qrCount++;
    localStorage.setItem("qrCount", String(qrCount));

    document.getElementById("qrCount").textContent = qrCount;
    qrText.textContent = `QR active for ${activeSession.module}`;
    qrText.style.color = "lightgreen";
});

attendanceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const module = attendanceModule.value.trim();
    const time = attendanceTime.value;

    if (module === "" || time === "") {
        attendanceMessage.textContent = "Fill all fields";
        attendanceMessage.style.color = "red";
        return;
    }

    const moduleExists = tutorModules.some(
        (item) => normalize(item) === normalize(module)
    );

    if (!moduleExists) {
        attendanceMessage.textContent = "Create this module first";
        attendanceMessage.style.color = "red";
        return;
    }

    attendanceSessions = attendanceSessions.map((session) => ({
        ...session,
        active: false
    }));

    const session = {
        id: Date.now().toString(),
        module: module,
        date: new Date().toLocaleDateString(),
        time: time,
        tutorId: loggedInTutor.id,
        active: true
    };

    attendanceSessions.push(session);
    saveSessions();
    displayReports();

    attendanceMessage.textContent = "Attendance Session Started";
    attendanceMessage.style.color = "lightgreen";

    attendanceForm.reset();
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInTutor");
    window.location.href = "home.html";
});

clearPlaceholders();
displayModules();
displayStudents();
displayReports();
document.getElementById("qrCount").textContent = qrCount;