const form = document.getElementById("tutorRegisterForm");
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

function getTutors() {
    const tutors =
        JSON.parse(localStorage.getItem("registeredTutors")) || [];
    const oldTutor = JSON.parse(localStorage.getItem("tutorUser"));

    if (
        oldTutor &&
        !tutors.some((tutor) => tutor.id === oldTutor.id)
    ) {
        tutors.push(oldTutor);
        localStorage.setItem("registeredTutors", JSON.stringify(tutors));
    }

    return tutors;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("tutorName").value.trim();
    const id = document.getElementById("tutorId").value.trim();
    const email = document.getElementById("tutorEmail").value.trim();
    const password = document.getElementById("tutorPassword").value;
    const confirmPassword =
        document.getElementById("tutorConfirmPassword").value;

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

    const tutors = getTutors();
    const tutorExists = tutors.some(
        (tutor) => tutor.id === id || tutor.email === email
    );

    if (tutorExists) {
        message.textContent = "Tutor ID or email already registered";
        message.style.color = "red";
        return;
    }

    const tutor = {
        name: name,
        id: id,
        email: email,
        password: password,
        role: "tutor"
    };

    tutors.push(tutor);
    localStorage.setItem("registeredTutors", JSON.stringify(tutors));
    localStorage.setItem("tutorUser", JSON.stringify(tutor));

    message.textContent = "Registered Successfully!";
    message.style.color = "lightgreen";

    form.reset();

    setTimeout(() => {
        window.location.href = "home.html";
    }, 1000);
});