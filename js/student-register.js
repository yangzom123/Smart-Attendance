const form = document.getElementById("studentRegisterForm");
const message = document.getElementById("message");

window.addEventListener("load", () => {
    form.reset();
    clearPlaceholders();
});

function clearPlaceholders() {
    const inputs = form.querySelectorAll("input");

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

function getStudents() {
    const students =
        JSON.parse(localStorage.getItem("registeredStudents")) || [];
    const oldStudent = JSON.parse(localStorage.getItem("studentUser"));

    if (
        oldStudent &&
        !students.some((student) => student.id === oldStudent.id)
    ) {
        students.push(oldStudent);
        localStorage.setItem(
            "registeredStudents",
            JSON.stringify(students)
        );
    }

    return students;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const id = document.getElementById("studentId").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const password = document.getElementById("studentPassword").value;
    const confirmPassword =
        document.getElementById("studentConfirmPassword").value;

    if (
        name === "" ||
        id === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        message.textContent = "All fields required";
        message.style.color = "red";
        return;
    }

    if (password.length < 6) {
        message.textContent = "Password must be at least 6 characters";
        message.style.color = "red";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match";
        message.style.color = "red";
        return;
    }

    const students = getStudents();
    const studentExists = students.some(
        (student) => student.id === id || student.email === email
    );

    if (studentExists) {
        message.textContent = "Student ID or email already registered";
        message.style.color = "red";
        return;
    }

    const student = {
        name: name,
        id: id,
        email: email,
        password: password,
        role: "student"
    };

    students.push(student);
    localStorage.setItem("registeredStudents", JSON.stringify(students));
    localStorage.setItem("studentUser", JSON.stringify(student));

    message.textContent = "Registered Successfully!";
    message.style.color = "lightgreen";

    form.reset();

    setTimeout(() => {
        window.location.href = "home.html";
    }, 1000);
});