import { apiRequest } from "./api.js";

const auth = firebase.auth();

document
  .getElementById("adminLoginForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const remember = document.getElementById("remember").checked;

    try {
      // Login with Firebase
      const userCredential = await auth.signInWithEmailAndPassword(email, pass);
      const token = await userCredential.user.getIdToken(true);

      if (remember) localStorage.setItem("idToken", token);
      else sessionStorage.setItem("idToken", token);

      // Get role from backend
      const profile = await apiRequest("/api/students/me");

      if (profile.role !== "admin") {
        alert("You are not an admin.");
        return;
      }

      // Redirect to admin page
      window.location.href = "admin.html";
    } catch (err) {
      console.error(err);
      alert("Invalid email or password.");
    }
  });
