/* EXPLORE BUTTON */

const exploreBtn = document.getElementById("exploreBtn");

exploreBtn.addEventListener("click", () => {
    alert("Welcome to Smart Attendance Tracker!");
});

/* DROPDOWN TOGGLE */

const dropdowns = document.querySelectorAll(".dropdown");

dropdowns.forEach((dropdown) => {

    const button = dropdown.querySelector(".dropdown-btn");

    button.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    });

});

/* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */

window.addEventListener("click", (event) => {

    dropdowns.forEach((dropdown) => {

        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("active");
        }

    });

});
