const form = document.getElementById("tutorLoginForm");
const message = document.getElementById("message");

const BASE_URL = "http://localhost:5000";

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

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("tutorId").value.trim();
    const password = document.getElementById("tutorPassword").value;

    if (id === "" || password === "") {
        message.textContent = "Enter tutor ID and password";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/auth/login/tutor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            message.style.color = "red";
            return;
        }

        // Save token and minimal user info (no password stored)
        localStorage.setItem("token", data.token);
        localStorage.setItem(
            "loggedInTutor",
            JSON.stringify({ name: data.name, id: data.id })
        );

        message.textContent = "Login Successful";
        message.style.color = "lightgreen";

        setTimeout(() => {
            window.location.href = "tutor-dashboard.html";
        }, 1000);

    } catch (err) {
        message.textContent = "Could not connect to server. Try again.";
        message.style.color = "red";
    }
});
