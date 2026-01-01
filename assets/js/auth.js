/* ============================
   SKYVAULT AUTH (SIMULATED)
============================ */

// Check auth state
function isSignedIn() {
    return !!localStorage.getItem("skyvault_id");
}

// Get current user ID
function getUserId() {
    return localStorage.getItem("skyvault_id");
}

// Store ID (sign in)
function signIn(id) {
    localStorage.setItem("skyvault_id", id);
}

// Clear session (sign out)
function signOut() {
    localStorage.removeItem("skyvault_id");
    window.location.href = "index.html";
}

// Generate random 6-char ID
function generateId() {
    return Math.random().toString(36).substring(2, 8);
}

// Validate ID format
function isValidId(id) {
    return /^[a-z0-9]{6}$/.test(id);
}

/* ============================
   HEADER UI HANDLER
   Call on every page
============================ */

document.addEventListener("DOMContentLoaded", () => {
    const authArea = document.querySelector(".auth-area");
    if (!authArea) return;

    if (isSignedIn()) {
        authArea.innerHTML = `
            <span>ID: <strong>${getUserId()}</strong></span>
            <a href="#" id="logout-link">Log out</a>
        `;
        document
            .getElementById("logout-link")
            .addEventListener("click", signOut);
    } else {
        console.log("Signed In");
        authArea.innerHTML = `
            <a href="sign-in.html" class="sign-in">Sign In</a>
        `;
    }
});