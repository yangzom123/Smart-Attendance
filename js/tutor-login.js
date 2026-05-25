const form = document.getElementById("tutorLoginForm");
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

    const id = document.getElementById("tutorId").value.trim();
    const password = document.getElementById("tutorPassword").value;

    if (id === "" || password === "") {
        message.textContent = "Enter tutor ID and password";
        message.style.color = "red";
        return;
    }

    const tutors = getTutors();
    const tutor = tutors.find(
        (user) => user.id === id && user.password === password
    );

    if (!tutor) {
        message.textContent = "Invalid Credentials";
        message.style.color = "red";
        return;
    }

    message.textContent = "Login Successful";
    message.style.color = "lightgreen";

    localStorage.setItem("loggedInTutor", JSON.stringify(tutor));

    setTimeout(() => {
        window.location.href = "tutor-dashboard.html";
    }, 1000);
});