import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  let allCourses = [];

  // Load Student Name
  try {
    const profile = await apiRequest("/api/students/me");

    // Set the button text to the user's name
    const userBtn = document.getElementById("userBtn");
    userBtn.textContent = profile.name;

    // Clicking the name logs out
    userBtn.addEventListener("click", logout);
  } catch (err) {
    console.error("Could not load student name:", err);
  }

  // Load Courses
  try {
    const data = await apiRequest("/api/students/me/courses");
    allCourses = data.courses;

    populateCourseDropdown(allCourses);
    renderTable(allCourses);
  } catch (err) {
    console.error(err);
    alert("Could not load courses.");
  }

  // Populate Course Dropdown
  function populateCourseDropdown(courses) {
    const dropdown = document.getElementById("courseFilter");

    // Clear old options except "All"
    dropdown.innerHTML = `<option value="">All</option>`;

    // Get unique courses
    const uniqueNames = [...new Set(courses.map((c) => c.name))];

    // Add each course
    uniqueNames.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      dropdown.appendChild(opt);
    });
  }

  // Render Tables
  function renderTable(courses) {
    const tbody = document.querySelector("#gradesTable tbody");
    tbody.innerHTML = "";

    if (!courses.length) {
      tbody.innerHTML = `<tr><td colspan="2">No courses found.</td></tr>`;
      return;
    }

    courses.forEach((course) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${course.name}</td>
        <td>${course.grade ?? "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Year Filter
  document.querySelectorAll(".year-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const year = btn.dataset.year;
      const filtered = allCourses.filter((c) => String(c.year) === year);
      renderTable(filtered);
    });
  });

  // ALL button
  document.getElementById("allBtn").addEventListener("click", () => {
    renderTable(allCourses);
  });

  // Course Dropdown Filter
  document.getElementById("courseFilter").addEventListener("change", (e) => {
    const selected = e.target.value;

    if (!selected) {
      renderTable(allCourses);
      return;
    }

    const filtered = allCourses.filter((c) => c.name === selected);
    renderTable(filtered);
  });
});
