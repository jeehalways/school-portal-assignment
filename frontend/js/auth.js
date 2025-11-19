import { apiRequest } from "./api.js";

const auth = firebase.auth();

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  const remember = document.getElementById("remember").checked;

  try {
    // Login with Firebase
    const userCredential = await auth.signInWithEmailAndPassword(email, pass);

    // Firebase returns a token (JWT)
    const token = await userCredential.user.getIdToken(/* forceRefresh */ true);

    // Store token
    if (remember) {
      localStorage.setItem("idToken", token); // persistent
    } else {
      sessionStorage.setItem("idToken", token); // clears after tab close
    }

    // Ask backend what role the user has (admin/student)
    const userInfo = await apiRequest("/api/students/me");

    if (userInfo.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "student.html";
    }
  } catch (err) {
    alert("Login failed. Check your email and password.");
    console.error(err);
  }
});

// FORGOT PASSWORD
document.getElementById("forgot")?.addEventListener("click", async () => {
  const email = prompt("Enter your email to reset password:");
  if (!email) return;

  try {
    await auth.sendPasswordResetEmail(email);
    alert("Password reset email sent.");
  } catch (err) {
    alert("Error sending reset link.");
    console.log(err);
  }
});

// LOGOUT function (used by other pages)
export function logout() {
  localStorage.removeItem("idToken");
  sessionStorage.removeItem("idToken");
  firebase.auth().signOut();
  window.location.href = "index.html";
}

// logout button handler
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
});
