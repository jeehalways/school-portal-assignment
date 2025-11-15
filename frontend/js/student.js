import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

// LOGOUT BUTTON
document.getElementById("logoutBtn").addEventListener("click", logout);

// Load data immediately
let allCourses = [];

async function loadCourses() {
  try {
    const data = await apiRequest("/api/students/me/courses");
    allCourses = data.courses; // expected: { name, year, grade }
    renderCourses(allCourses);
  } catch (err) {
    console.error(err);
    alert("Could not load courses.");
  }
}

loadCourses();

// FILTER LOGIC
document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    const year = btn.dataset.year;

    if (year === "all") {
      renderCourses(allCourses);
      return;
    }

    const filtered = allCourses.filter((c) => String(c.year) === year);
    renderCourses(filtered);
  });
});

// RENDER FUNCTION
function renderCourses(courses) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!courses.length) {
    container.innerHTML = "<p>No courses found.</p>";
    return;
  }

  courses.forEach((course) => {
    const div = document.createElement("div");
    div.className = "course-card";
    div.innerHTML = `
      <h3>${course.name}</h3>
      <p><strong>Year:</strong> ${course.year}</p>
      <p><strong>Grade:</strong> ${course.grade ?? "-"}</p>
    `;
    container.appendChild(div);
  });
}
