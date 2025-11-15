import { logout } from "./auth.js";

// Toggle admin menu
const adminUserBtn = document.getElementById("adminUserBtn");
const adminMenu = document.getElementById("adminMenu");

adminUserBtn.addEventListener("click", () => {
  adminMenu.classList.toggle("show");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", logout);

// Navigation buttons
document.getElementById("gradesBtn").addEventListener("click", () => {
  window.location.href = "admin-grades.html";
});

document.getElementById("studentsBtn").addEventListener("click", () => {
  window.location.href = "admin-students.html";
});
