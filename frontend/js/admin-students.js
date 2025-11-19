import { apiRequest } from "./api.js";
import { logout } from "./auth.js";

// Auth Token Refresh 
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }
  const token = await user.getIdToken(true);
  localStorage.setItem("idToken", token);
});

// Load Admin Name 
async function loadAdminName() {
  try {
    const admin = await apiRequest("/api/students/me");
    document.getElementById("adminUserBtn").textContent = admin.name;
    document.getElementById("adminUserBtn").addEventListener("click", logout);
  } catch (err) {
    console.error("Could not load admin name:", err);
  }
}
loadAdminName();

// Data
let allStudents = [];
let currentEditingId = null;

// Load Students
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

// Year Filter 
document.querySelectorAll(".year-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const year = Number(btn.dataset.year);
    renderStudents(allStudents.filter((s) => Number(s.year) === year));
  });
});
document.getElementById("allBtn").addEventListener("click", () => {
  renderStudents(allStudents);
});

// RENDER TABLE 
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

    // Open popup on click only
    tr.addEventListener("click", (e) => {
      e.stopPropagation();
      showPopup(e, student);
    });

    tbody.appendChild(tr);
  });
}

// POPUP LOGIC 
const popup = document.getElementById("popup");

// Close when clicking outside
document.addEventListener("click", (e) => {
  if (!popup.contains(e.target)) hidePopup();
});

function showPopup(event, student) {
  popup.style.display = "block";

  // Position near click
  popup.style.top = event.pageY + 15 + "px";
  popup.style.left = event.pageX + 15 + "px";

  currentEditingId = student.id;

  // View mode
  document.getElementById("popupName").textContent = student.name;
  document.getElementById("popupEmail").textContent = student.email;
  document.getElementById("popupPhone").textContent = student.phone || "N/A";
  document.getElementById("popupAddress").textContent =
    student.address || "N/A";

  // Edit fields
  document.getElementById("editName").value = student.name;
  document.getElementById("editEmail").value = student.email;
  document.getElementById("editPhone").value = student.phone ?? "";
  document.getElementById("editAddress").value = student.address ?? "";
  document.getElementById("editYear").value = student.year;

  // Mode toggle
  document.getElementById("viewMode").classList.remove("hidden");
  document.getElementById("editMode").classList.add("hidden");

  // Buttons
  document.getElementById("editBtn").onclick = () => switchToEditMode();
  document.getElementById("deleteBtn").onclick = () =>
    deleteStudent(student.id);
}

function hidePopup() {
  popup.style.display = "none";
}

// EDIT MODE 
function switchToEditMode() {
  document.getElementById("viewMode").classList.add("hidden");
  document.getElementById("editMode").classList.remove("hidden");

  document.getElementById("saveBtn").onclick = saveEdits;
  document.getElementById("cancelBtn").onclick = () => {
    document.getElementById("editMode").classList.add("hidden");
    document.getElementById("viewMode").classList.remove("hidden");
  };
}

async function saveEdits() {
  const id = currentEditingId;
  const updated = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    phone: document.getElementById("editPhone").value || null,
    address: document.getElementById("editAddress").value || null,
    year: Number(document.getElementById("editYear").value),
  };

  try {
    await apiRequest(`/api/admin/students/${id}`, "PUT", updated);
    alert("Student updated!");

    allStudents = allStudents.map((s) =>
      s.id === id ? { ...s, ...updated } : s
    );
    renderStudents(allStudents);

    // Update popup immediately
    showPopup({ pageX: popup.offsetLeft, pageY: popup.offsetTop }, updated);
  } catch (err) {
    console.error(err);
    alert("Could not update student.");
  }
}

// DELETE
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;
  try {
    await apiRequest(`/api/admin/students/${id}`, "DELETE");
    alert("Student deleted!");
    // Refresh List
    allStudents = allStudents.filter((s) => s.id !== id);
    renderStudents(allStudents);
    hidePopup();
  } catch (err) {
    console.error(err);
    alert("Could not delete student.");
  }
}
