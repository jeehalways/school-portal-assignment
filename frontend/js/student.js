import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  let allCourses = [];
  // Helper: get a "base" name for grouping (e.g. "Engelska 5" -> "Engelska")
  function getBaseCourseName(name) {
    if (!name) return "";

    // Split into words
    const parts = name.trim().split(/\s+/);

    // If last part contains a digit (like "5" or "1b"), drop it
    const last = parts[parts.length - 1];
    if (/\d/.test(last)) {
      parts.pop();
    }

    return parts.join(" ");
  }

  // Load Student Name
  try {
    const profile = await apiRequest("/api/students/me");

    // Set the button text to the user's name
    const userBtn = document.getElementById("userBtn");
    userBtn.textContent = profile.name;

    // Clicking name logs out
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

    // Extract base names (remove digits)
    const baseNames = [
      ...new Set(courses.map((c) => c.name.replace(/\d+/g, "").trim())),
    ];

    baseNames.forEach((base) => {
      const opt = document.createElement("option");
      opt.value = base;
      opt.textContent = base;
      dropdown.appendChild(opt);
    });
  }

  // Render Table (updated for grouping by base name)
  function renderTable(courses) {
    const tbody = document.querySelector("#gradesTable tbody");
    tbody.innerHTML = "";

    if (!courses.length) {
      tbody.innerHTML = `<tr><td colspan="3">No courses found.</td></tr>`;
      return;
    }

    courses.forEach((course) => {
      const grade = course.grade ?? "-";

      const tr = document.createElement("tr");

      tr.innerHTML = `
      <td>${course.name}</td>
      <td>${course.year}</td>
      <td class="${grade === "F" ? "grade-fail" : ""}">
        ${grade}
      </td>
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

    // Match base name ignoring year number
    // Example: "Engelska" matches "Engelska 1", "Engelska 2", "Engelska 3"
    const filtered = allCourses.filter((c) => {
      const baseName = c.name.replace(/\d+/g, "").trim(); // remove numbers
      return baseName === selected;
    });

    renderTable(filtered);
  });
});
