document.addEventListener("DOMContentLoaded", function () {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    toggleLoginLogoutButtons(isLoggedIn);
});

function toggleLoginLogoutButtons(isLoggedIn) {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (isLoggedIn) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
}

function login() {
    // Simulate successful login
    localStorage.setItem("isLoggedIn", "true");
    toggleLoginLogoutButtons(true);
}

function logout() {
    // Clear login state and redirect to the homepage
    localStorage.removeItem("isLoggedIn");
    toggleLoginLogoutButtons(false);
    window.location.href = "index.html"; // Redirect after logout
}
