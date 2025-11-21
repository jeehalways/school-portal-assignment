import { apiRequest } from "./api.js";

const auth = firebase.auth();

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;

  // Login with Firebase
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, pass);

    // Get fresh token
    const token = await userCredential.user.getIdToken(true);

    // Store Token
    if (remember) {
      localStorage.setItem("idToken", token);
    } else {
      sessionStorage.setItem("idToken", token);
    }

    // Ask backend for role
    const userInfo = await apiRequest("/api/students/me");

    if (userInfo.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "student.html";
    }
  } catch (err) {
    alert("Login failed. Check your credentials.");
    console.error(err);
  }
});

// AUTO TOKEN REFRESH
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) return;

  // Refresh token every time auth changes
  const token = await user.getIdToken(true);
  localStorage.setItem("idToken", token);
  sessionStorage.setItem("idToken", token);
});

// FORGOT PASSWORD

document.getElementById("forgot")?.addEventListener("click", async () => {
  const email = prompt("Enter your email to reset password:");
  if (!email) return;

  try {
    await auth.sendPasswordResetEmail(email);
    alert("Password reset email sent.");
  } catch (err) {
    alert("Could not send reset link.");
    console.error(err);
  }
});

// LOGOUT
export function logout() {
  localStorage.removeItem("idToken");
  sessionStorage.removeItem("idToken");
  auth.signOut();
  window.location.href = "index.html";
}

// Bind logout button if exists
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
});
