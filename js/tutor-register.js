const form = document.getElementById("tutorRegisterForm");
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

    try {
        const response = await fetch(`${BASE_URL}/api/auth/register/tutor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, id, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            message.style.color = "red";
            return;
        }

        message.textContent = "Registered Successfully!";
        message.style.color = "lightgreen";
        form.reset();

        setTimeout(() => {
            window.location.href = "home.html";
        }, 1000);

    } catch (err) {
        message.textContent = "Could not connect to server. Try again.";
        message.style.color = "red";
    }
});
