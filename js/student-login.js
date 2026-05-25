const form = document.getElementById("studentLoginForm");
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

    const id = document.getElementById("studentId").value.trim();
    const password = document.getElementById("studentPassword").value;

    if (id === "" || password === "") {
        message.textContent = "Enter student ID and password";
        message.style.color = "red";
        return;
    }

    const students = getStudents();
    const student = students.find(
        (user) => user.id === id && user.password === password
    );

    if (!student) {
        message.textContent = "Invalid Credentials";
        message.style.color = "red";
        return;
    }

    message.textContent = "Login Successful";
    message.style.color = "lightgreen";

    localStorage.setItem("loggedInStudent", JSON.stringify(student));

    setTimeout(() => {
        window.location.href = "student-dashboard.html";
    }, 1000);
});