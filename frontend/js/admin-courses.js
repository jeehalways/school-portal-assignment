import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

// AUTH / TOKEN REFRESH
// Make sure only logged-in admins can be here, and keep token fresh
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }

  // Force refresh token so backend doesn't see "id-token-expired"
  const token = await user.getIdToken(true);
  localStorage.setItem("idToken", token);
});

// ADMIN NAME + LOGOUT

async function loadAdminName() {
  try {
    const admin = await apiRequest("/api/students/me");
    const btn = document.getElementById("adminUserBtn");
    if (!btn) return;

    btn.textContent = admin.name;

    // Clicking the name logs out
    btn.addEventListener("click", logout);
  } catch (err) {
    console.error("Could not load admin name:", err);
  }
}
loadAdminName();

// STATE

let allCourses = [];
let currentEditingId = null;

// DOM REFS

const nameInput = document.getElementById("courseName");
const yearSelect = document.getElementById("courseYear");
const addCourseBtn = document.getElementById("addCourseBtn");
const coursesTableBody = document.querySelector("#coursesTable tbody");

// LOAD COURSES

async function loadCourses() {
  try {
    const data = await apiRequest("/api/admin/courses");
    allCourses = data.courses || [];
    renderCourses(allCourses);
  } catch (err) {
    console.error("Could not load courses:", err);
    alert("Could not load courses from server.");
  }
}

loadCourses();

// RENDER TABLE

function renderCourses(list) {
  if (!coursesTableBody) return;

  coursesTableBody.innerHTML = "";

  if (!list.length) {
    coursesTableBody.innerHTML =
      '<tr><td colspan="3">No courses found.</td></tr>';
    return;
  }

  list.forEach((course) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${course.name}</td>
      <td>${course.year}</td>
      <td>
        <button class="btn edit-btn">Edit</button>
        <button class="btn-dark delete-btn">Delete</button>
      </td>
    `;

    const editBtn = tr.querySelector(".edit-btn");
    const deleteBtn = tr.querySelector(".delete-btn");

    if (editBtn) {
      editBtn.addEventListener("click", () => startEditCourse(course));
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteCourse(course.id));
    }

    coursesTableBody.appendChild(tr);
  });
}

// FORM LOGIC (CREATE / UPDATE)

// One button, two modes: "Add course" vs "Save changes"
if (addCourseBtn) {
  addCourseBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const yearValue = yearSelect.value;

    if (!name || !yearValue) {
      alert("Please enter a course name and select a year.");
      return;
    }

    const year = Number(yearValue);

    try {
      if (!currentEditingId) {
        // CREATE
        const response = await apiRequest("/api/admin/courses", "POST", {
          name,
          year,
        });

        const newCourse = response.course || response;

        allCourses.push(newCourse);
        renderCourses(allCourses);
        resetForm();
        alert("Course added.");
      } else {
        // UPDATE
        await apiRequest(`/api/admin/courses/${currentEditingId}`, "PUT", {
          name,
          year,
        });

        allCourses = allCourses.map((c) =>
          c.id === currentEditingId ? { ...c, name, year } : c
        );

        renderCourses(allCourses);
        resetForm();
        alert("Course updated.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not save course.");
    }
  });
}

// EDIT COURSE

function startEditCourse(course) {
  currentEditingId = course.id;
  nameInput.value = course.name;
  yearSelect.value = String(course.year);
  addCourseBtn.textContent = "Save changes";
}

// DELETE COURSE

async function deleteCourse(id) {
  if (!confirm("Are you sure you want to delete this course?")) return;

  try {
    await apiRequest(`/api/admin/courses/${id}`, "DELETE");

    allCourses = allCourses.filter((c) => c.id !== id);
    renderCourses(allCourses);

    // If we were editing this course, reset the form
    if (currentEditingId === id) {
      resetForm();
    }

    alert("Course deleted.");
  } catch (err) {
    console.error(err);
    alert("Could not delete course.");
  }
}

// HELPERS

function resetForm() {
  currentEditingId = null;
  nameInput.value = "";
  yearSelect.value = "";
  addCourseBtn.textContent = "Add course";
}
