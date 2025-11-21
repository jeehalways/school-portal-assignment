import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

// ADMIN NAME + LOGOUT
async function loadAdminName() {
  try {
    const profile = await apiRequest("/api/students/me");
    const btn = document.getElementById("adminUserBtn");
    btn.textContent = profile.name;
    btn.addEventListener("click", logout);
  } catch (err) {
    console.error("Could not load admin profile:", err);
  }
}
loadAdminName();

// GLOBAL STATE
let allStudents = [];
let allCourses = [];
let allGrades = [];
let currentEditingGradeId = null;

// DOM REFS (for the form)
const studentSelect = document.getElementById("studentSelect");
const courseSelect = document.getElementById("courseSelect");
const gradeSelect = document.getElementById("gradeSelect");
const addGradeBtn = document.getElementById("addGradeBtn");

// INITIAL LOAD
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

// SELECT DROPDOWNS (ADD/EDIT FORM)
function fillStudentSelect() {
  studentSelect.innerHTML = "";

  allStudents.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.email})`;
    studentSelect.appendChild(opt);
  });
}

function fillCourseSelect() {
  const select = document.getElementById("courseSelect");
  select.innerHTML = "";

  allCourses.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

// COURSE FILTER (HEADER)

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
    const list = selected
      ? allGrades.filter((g) => g.course === selected)
      : allGrades;
    renderGradesTable(list);
  });
}

// ADD / UPDATE GRADE (ONE BUTTON, TWO MODES)

addGradeBtn.addEventListener("click", async () => {
  const studentId = studentSelect.value;
  const course = courseSelect.value;
  const grade = gradeSelect.value;

  if (!studentId || !course || !grade) {
    alert("Please select a student, course, and grade.");
    return;
  }

  try {
    if (!currentEditingGradeId) {
      // CREATE
      const courseId = Number(document.getElementById("courseSelect").value);

      const response = await apiRequest("/api/admin/grades", "POST", {
        studentId: Number(studentId),
        courseId: courseId,
        grade: grade,
      });

      const student = allStudents.find(
        (s) => String(s.id) === String(studentId)
      );
      const courseObj = allCourses.find((c) => c.name === course);

      const enrichedGrade = {
        ...response.grade,
        studentName: student ? student.name : "(unknown)",
        course,
        year: courseObj ? courseObj.year : undefined,
      };

      allGrades.unshift(enrichedGrade);
      renderGradesTable(allGrades);
      resetForm();
      alert("Grade added.");
    } else {
      // UPDATE (only grade is updated on backend)
      await apiRequest(`/api/admin/grades/${currentEditingGradeId}`, "PUT", {
        grade,
      });

      allGrades = allGrades.map((g) =>
        String(g.id) === String(currentEditingGradeId) ? { ...g, grade } : g
      );

      renderGradesTable(allGrades);
      resetForm();
      alert("Grade updated.");
    }
  } catch (err) {
    console.error(err);
    alert("Could not save grade.");
  }
});

// YEAR FILTER BUTTONS

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

// SUMMARY HELPERS

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

// RENDER TABLE (WITH EDIT / DELETE)

function renderGradesTable(list) {
  const tbody = document.querySelector("#gradesLogTable tbody");
  tbody.innerHTML = "";

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5">No grades found.</td></tr>`;
    updateSummary(list);
    return;
  }

  list.forEach((g) => {
    const row = document.createElement("tr");

    if (g.grade === "F") row.classList.add("grade-fail");

    row.innerHTML = `
      <td>${g.studentName}</td>
      <td>${g.course}</td>
      <td>${g.grade}</td>
      <td>${g.date || "-"}</td>
      <td>
        <button class="btn edit-btn" data-id="${g.id}">Edit</button>
        <button class="btn-dark delete-btn" data-id="${g.id}">Delete</button>
      </td>
    `;

    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    if (editBtn) {
      editBtn.addEventListener("click", () => startEditGrade(g));
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => deleteGrade(g.id));
    }

    tbody.appendChild(row);
  });

  updateSummary(list);
}

// EDIT GRADE (FILL FORM, CHANGE BUTTON LABEL)

function startEditGrade(grade) {
  currentEditingGradeId = grade.id;

  // Try to select correct student & course in dropdowns, based on names
  const student = allStudents.find((s) => s.name === grade.studentName);
  const course = allCourses.find((c) => c.name === grade.course);

  if (student) {
    studentSelect.value = String(student.id);
  }

  if (course) {
    courseSelect.value = course.name;
  }

  gradeSelect.value = grade.grade;

  addGradeBtn.textContent = "Save changes";
}

// DELETE GRADE

async function deleteGrade(id) {
  if (!confirm("Are you sure you want to delete this grade?")) return;

  try {
    await apiRequest(`/api/admin/grades/${id}`, "DELETE");

    allGrades = allGrades.filter((g) => String(g.id) !== String(id));
    renderGradesTable(allGrades);

    if (String(currentEditingGradeId) === String(id)) {
      resetForm();
    }

    alert("Grade deleted.");
  } catch (err) {
    console.error(err);
    alert("Could not delete grade.");
  }
}

// HELPERS

function resetForm() {
  currentEditingGradeId = null;

  if (allStudents.length) {
    studentSelect.value = String(allStudents[0].id);
  }
  if (allCourses.length) {
    courseSelect.value = allCourses[0].name;
  }
  gradeSelect.value = "A";

  addGradeBtn.textContent = "Add Grade";
}
