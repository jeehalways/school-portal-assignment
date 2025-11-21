import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

// Load admin name + logout on click
async function loadAdminName() {
  try {
    const profile = await apiRequest("/api/students/me");
    document.getElementById("adminUserBtn").textContent = profile.name;
    document.getElementById("adminUserBtn").addEventListener("click", logout);
  } catch (err) {
    console.error("Could not load admin profile:", err);
  }
}
loadAdminName();

// Global data
let allStudents = [];
let allCourses = [];
let allGrades = [];

// Initial load
async function init() {
  try {
    // Students
    const studentsRes = await apiRequest("/api/admin/students");
    allStudents = studentsRes.students;

    // Courses
    const coursesRes = await apiRequest("/api/admin/courses");
    allCourses = coursesRes.courses;

    // Grades log
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

// POPULATE SELECTS

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

// Course filter in header
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

// Add Grade Button 
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
      studentId: Number(studentId),
      course,
      grade,
    });

    alert("Grade added successfully!");

    // Enrich new grade so it matches existing rows (has studentName + year)
    const student = allStudents.find((s) => String(s.id) === String(studentId));
    const courseObj = allCourses.find((c) => c.name === course);

    const enrichedGrade = {
      ...response.grade,
      studentName: student ? student.name : "(unknown)",
      course,
      year: courseObj ? courseObj.year : undefined,
    };

    allGrades.push(enrichedGrade);
    renderGradesTable(allGrades);
  } catch (err) {
    console.error(err);
    alert("Could not add grade.");
  }
});

// Year Filter Buttons 
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

// Summary Helpers 
function computeSummary(list) {
  const summary = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  list.forEach((g) => {
    if (summary[g.grade] !== undefined) {
      summary[g.grade] += 1;
    }
  });
  return { total: list.length, summary };
}

function updateSummary(list) {
  const el = document.getElementById("gradesSummary");
  if (!el) return;

  if (!list.length) {
    el.textContent = "No grades to show.";
    return;
  }

  const { total, summary } = computeSummary(list);
  el.textContent = `Total: ${total} · A:${summary.A} B:${summary.B} C:${summary.C} D:${summary.D} E:${summary.E} F:${summary.F}`;
}

// Render Table 
function renderGradesTable(list) {
  const tbody = document.querySelector("#gradesLogTable tbody");
  tbody.innerHTML = "";

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4">No grades found.</td></tr>`;
    updateSummary(list);
    return;
  }

  list.forEach((g) => {
    const row = document.createElement("tr");

    // Highlight failing grades
    if (g.grade === "F") {
      row.classList.add("grade-fail");
    }

    row.innerHTML = `
      <td>${g.studentName}</td>
      <td>${g.course}</td>
      <td>${g.grade}</td>
      <td>${g.date || "-"}</td>
    `;

    tbody.appendChild(row);
  });

  updateSummary(list);
}
