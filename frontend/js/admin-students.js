import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

// Load admin name + set logout behavior
async function loadAdminName() {
  try {
    const admin = await apiRequest("/api/students/me");
    document.getElementById("adminUserBtn").textContent = admin.name;

    // Clicking admin button logs out
    document.getElementById("adminUserBtn").addEventListener("click", logout);
  } catch (err) {
    console.error("Could not load admin name:", err);
  }
}
loadAdminName();

// Date 
let allStudents = [];

//Load Students 
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

//Yerar Filter
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

// Render Student Table 
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

    // Hover popup 
    tr.addEventListener("mouseenter", (e) => showPopup(e, student));
    tr.addEventListener("mouseleave", hidePopup);

    tbody.appendChild(tr);
  });
}

//Popup Logic
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

// Edith and Delete Actions 
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
