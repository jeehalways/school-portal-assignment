import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

/* ---------------------- MENU LOGIC ---------------------- */
const adminBtn = document.getElementById("adminUserBtn");
const adminMenu = document.getElementById("adminMenu");

adminBtn.addEventListener("click", () => {
  adminMenu.classList.toggle("show");
});

document.getElementById("logoutBtn").addEventListener("click", logout);

/* ---------------------- DATA ---------------------- */
let allStudents = [];

/* ---------------------- LOAD STUDENTS ---------------------- */
async function loadStudents() {
  try {
    const data = await apiRequest("/api/admin/students");
    allStudents = data.students;
    renderStudents(allStudents);
  } catch (err) {
    console.error(err);
    alert("Could not load student accounts.");
  }
}

loadStudents();

/* ---------------------- YEAR FILTER ---------------------- */
document.querySelectorAll(".year-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const year = Number(btn.dataset.year);
    const filtered = allStudents.filter((s) => Number(s.year) === year);
    renderStudents(filtered);
  });
});

document.getElementById("allBtn").addEventListener("click", () => {
  renderStudents(allStudents);
});

/* ---------------------- RENDER STUDENT TABLE ---------------------- */
function renderStudents(list) {
  const tbody = document.querySelector("#studentsTable tbody");
  tbody.innerHTML = "";

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="3">No students found.</td></tr>`;
    return;
  }

  list.forEach((student) => {
    const tr = document.createElement("tr");
    tr.dataset.id = student.id;

    tr.innerHTML = `
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.year}</td>
    `;

    /* Hover popup */
    tr.addEventListener("mouseenter", (e) => showPopup(e, student));
    tr.addEventListener("mouseleave", hidePopup);

    tbody.appendChild(tr);
  });
}

/* ---------------------- POPUP LOGIC ---------------------- */
const popup = document.getElementById("popup");

function showPopup(event, student) {
  popup.style.display = "block";
  popup.style.top = event.pageY + 10 + "px";
  popup.style.left = event.pageX + 10 + "px";

  document.getElementById("popupName").textContent = student.name;
  document.getElementById("popupEmail").textContent = student.email;
  document.getElementById("popupPhone").textContent = student.phone || "N/A";
  document.getElementById("popupAddress").textContent =
    student.address || "N/A";

  document.getElementById("editBtn").onclick = () => editStudent(student.id);
  document.getElementById("deleteBtn").onclick = () =>
    deleteStudent(student.id);
}

function hidePopup() {
  popup.style.display = "none";
}

/* ---------------------- EDIT & DELETE ACTIONS ---------------------- */
function editStudent(id) {
  window.location.href = `edit-student.html?id=${id}`;
}

async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    await apiRequest(`/api/admin/students/${id}`, "DELETE");
    alert("Student deleted.");

    // Refresh list
    allStudents = allStudents.filter((s) => s.id !== id);
    renderStudents(allStudents);
  } catch (err) {
    console.error(err);
    alert("Could not delete student.");
  }
}
