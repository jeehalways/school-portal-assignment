import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

/* ADMIN MENU LOGIC */

const adminUserBtn = document.getElementById("adminUserBtn");
const adminMenu = document.getElementById("adminMenu");

// Toggle dropdown
adminUserBtn.addEventListener("click", () => {
  adminMenu.classList.toggle("show");
});

// Logout
document.getElementById("adminLogout").addEventListener("click", logout);

/* GLOBAL DATA */

let allStudents = [];
let allCourses = [];
let allGrades = [];

/*  INITIAL LOAD */

async function init() {
  try {
    // GET all students
    const studentsRes = await apiRequest("/api/admin/students");
    allStudents = studentsRes.students;

    // GET all courses
    const coursesRes = await apiRequest("/api/admin/courses");
    allCourses = coursesRes.courses;

    // GET grades log
    const gradesRes = await apiRequest("/api/admin/grades");
    allGrades = gradesRes.grades;

    fillStudentSelect();
    fillCourseSelect();
    fillCourseFilterDropdown();
    renderGradesTable(allGrades);
  } catch (err) {
    console.error(err);
    alert("Error loading admin data.");
  }
}

init();

/* POPULATE SELECT FIELDS */

// Fill student dropdown
function fillStudentSelect() {
  const select = document.getElementById("studentSelect");
  select.innerHTML = "";

  allStudents.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.email})`;
    select.appendChild(opt);
  });
}

// Fill course dropdown (for adding grades)
function fillCourseSelect() {
  const select = document.getElementById("courseSelect");
  select.innerHTML = "";

  allCourses.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

// Fill course filter in admin menu
function fillCourseFilterDropdown() {
  const filter = document.getElementById("courseFilter");

  filter.innerHTML = `<option value="">All</option>`;

  allCourses.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = c.name;
    filter.appendChild(opt);
  });

  filter.addEventListener("change", () => {
    const selected = filter.value;

    if (!selected) {
      renderGradesTable(allGrades);
    } else {
      const filtered = allGrades.filter((g) => g.course === selected);
      renderGradesTable(filtered);
    }
  });
}

/* ADD GRADE BUTTON LOGIC */

document.getElementById("addGradeBtn").addEventListener("click", async () => {
  const studentId = document.getElementById("studentSelect").value;
  const course = document.getElementById("courseSelect").value;
  const grade = document.getElementById("gradeSelect").value;

  if (!studentId || !course || !grade) {
    alert("Please select a student, course, and grade.");
    return;
  }

  try {
    const response = await apiRequest("/api/admin/grades", "POST", {
      studentId,
      course,
      grade,
    });

    alert("Grade added successfully!");

    // Add new grade to local list
    allGrades.push(response.grade);

    // Refresh table
    renderGradesTable(allGrades);
  } catch (err) {
    console.error(err);
    alert("Could not add grade.");
  }
});

/* YEAR FILTER BUTTON LOGIC */

document.querySelectorAll(".year-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const year = Number(btn.dataset.year);
    const filtered = allGrades.filter((g) => Number(g.year) === year);
    renderGradesTable(filtered);
  });
});

document.getElementById("allBtn").addEventListener("click", () => {
  renderGradesTable(allGrades);
});

/* RENDER GRADES TABLE */

function renderGradesTable(list) {
  const tbody = document.querySelector("#gradesLogTable tbody");
  tbody.innerHTML = "";

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4">No grades found.</td></tr>`;
    return;
  }

  list.forEach((g) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${g.studentName}</td>
      <td>${g.course}</td>
      <td>${g.grade}</td>
      <td>${g.date || "-"}</td>
    `;

    tbody.appendChild(row);
  });
}
