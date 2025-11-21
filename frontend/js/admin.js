import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Load admin name
  try {
    const profile = await apiRequest("/api/students/me");
    document.getElementById("adminUserBtn").textContent = profile.name;
  } catch (err) {
    console.error("Could not load admin profile:", err);
  }

  // Logout when clicking name button
  document.getElementById("adminUserBtn").addEventListener("click", logout);

  // Navigation buttons
  document.getElementById("gradesBtn").addEventListener("click", () => {
    window.location.href = "admin-grades.html";
  });

  document.getElementById("studentsBtn").addEventListener("click", () => {
    window.location.href = "admin-students.html";
  });

  document.getElementById("coursesBtn").addEventListener("click", () => {
    window.location.href = "admin-courses.html";
  });
});
