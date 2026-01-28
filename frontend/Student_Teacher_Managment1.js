/**
 * KITE ACADEMIC PORTAL - PURE FRONTEND VERSION
 * STORAGE: LocalStorage (Browser Database)
 */

// ==================== CONFIGURATION ====================
const STORAGE_KEY = "kite_portal_data";

// Mock Database for Authentication (Formerly in Python)
const FACULTY_CREDENTIALS = {
  "APARNA": "APARNA4508",
  "KUMARNALLANA": "KUMAR4505",
};

const STUDENT_CREDENTIALS = {
  "HAIMA": "HAIMA4502",
  "DURGAPRASAD": "DURGA450x",
  "SHIVA": "SHIVA450x"
};

// ==================== APPLICATION STATE ====================
const AppState = {
  user: null,
  role: null,
  previewMode: false,
  students: [],
  attendanceStack: [],
  currentStudentView: null,
};

// ==================== STUDENT CLASS ====================
class Student {
  constructor(name, roll_no) {
    this.name = name;
    this.roll_no = roll_no;
    this.marks = [];
    this.total_marks = 0;
    this.percentage = 0;
    this.grade = "Fail";
    this.attendance = "Not Marked";
  }

  calculateResult() {
    if (!this.marks || this.marks.length === 0) {
      this.total_marks = 0;
      this.percentage = 0;
      this.grade = "Fail";
      return;
    }
    // Ensure marks are numbers
    const numericMarks = this.marks.map(m => Number(m));
    this.total_marks = numericMarks.reduce((sum, mark) => sum + mark, 0);
    this.percentage = this.total_marks / numericMarks.length;

    if (this.percentage >= 90) this.grade = "A";
    else if (this.percentage >= 75) this.grade = "B";
    else if (this.percentage >= 50) this.grade = "C";
    else if (this.percentage >= 35) this.grade = "D";
    else this.grade = "Fail";
    
    this.marks = numericMarks; // Update with clean numbers
  }

  static fromJSON(data) {
    const student = new Student(data.name, data.roll_no);
    Object.assign(student, data);
    return student;
  }
}

// ==================== DOM CACHE ====================
const DOM = {
  loginScreen: null,
  facultyPortal: null,
  studentPortal: null,
  loginForm: null,
  loginUsername: null,
  loginPassword: null,
  usernameError: null,
  passwordError: null,
  facultyName: null,
  facultyTabTitle: null,
  studentTableBody: null,
  emptyTableMessage: null,
  studentForm: null,
  marksContainer: null,
  attendanceForm: null,
  attendanceSelect: null,
  undoBtn: null,
  undoCount: null,
  classTreeDisplay: null,
  statTotal: null,
  statPresent: null,
  statAverage: null,
  analyticsTotal: null,
  analyticsAverage: null,
  analyticsAttendance: null,
  analyticsPass: null,
  gradeChart: null,
  attendanceChart: null,
  performersChart: null,
  previewBadge: null,
  studentDisplayName: null,
  reportName: null,
  reportRoll: null,
  reportGrade: null,
  reportPercentage: null,
  reportTotal: null,
  reportAttendance: null,
  reportMarksList: null,
  noMarksMessage: null,
  settingsForm: null,
  toastContainer: null,
};

// ==================== INITIALIZATION ====================
function init() {
  cacheDOMElements();
  loadDataFromStorage(); // Replaces fetchStudents()
  setupEventListeners();
}

function cacheDOMElements() {
  DOM.loginScreen = document.getElementById("login-screen");
  DOM.facultyPortal = document.getElementById("faculty-portal");
  DOM.studentPortal = document.getElementById("student-portal");
  DOM.loginForm = document.getElementById("login-form");
  DOM.loginUsername = document.getElementById("login-username");
  DOM.loginPassword = document.getElementById("login-password");
  DOM.usernameError = document.getElementById("username-error");
  DOM.passwordError = document.getElementById("password-error");
  DOM.facultyName = document.getElementById("faculty-name");
  DOM.facultyTabTitle = document.getElementById("faculty-tab-title");
  DOM.studentTableBody = document.getElementById("student-table-body");
  DOM.emptyTableMessage = document.getElementById("empty-table-message");
  DOM.studentForm = document.getElementById("student-form");
  DOM.marksContainer = document.getElementById("marks-container");
  DOM.attendanceForm = document.getElementById("attendance-form");
  DOM.attendanceSelect = document.getElementById("attendance-student");
  DOM.undoBtn = document.getElementById("undo-attendance-btn");
  DOM.undoCount = document.getElementById("undo-count");
  DOM.classTreeDisplay = document.getElementById("class-tree-display");
  DOM.statTotal = document.getElementById("stat-total");
  DOM.statPresent = document.getElementById("stat-present");
  DOM.statAverage = document.getElementById("stat-average");
  DOM.analyticsTotal = document.getElementById("analytics-total");
  DOM.analyticsAverage = document.getElementById("analytics-average");
  DOM.analyticsAttendance = document.getElementById("analytics-attendance");
  DOM.analyticsPass = document.getElementById("analytics-pass");
  DOM.gradeChart = document.getElementById("grade-chart");
  DOM.attendanceChart = document.getElementById("attendance-chart");
  DOM.performersChart = document.getElementById("performers-chart");
  DOM.previewBadge = document.getElementById("preview-badge");
  DOM.studentDisplayName = document.getElementById("student-display-name");
  DOM.reportName = document.getElementById("report-name");
  DOM.reportRoll = document.getElementById("report-roll");
  DOM.reportGrade = document.getElementById("report-grade");
  DOM.reportPercentage = document.getElementById("report-percentage");
  DOM.reportTotal = document.getElementById("report-total");
  DOM.reportAttendance = document.getElementById("report-attendance");
  DOM.reportMarksList = document.getElementById("report-marks-list");
  DOM.noMarksMessage = document.getElementById("no-marks-message");
  DOM.settingsForm = document.getElementById("settings-form");
  DOM.toastContainer = document.getElementById("toast-container");
}

// ==================== PURE JS DATA LOGIC (No Python) ====================

// 1. LOAD Data (Replaces GET /students)
function loadDataFromStorage() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      AppState.students = parsedData.map((s) => Student.fromJSON(s));
    } catch (e) {
      console.error("Corrupt data in storage, resetting.");
      AppState.students = [];
    }
  } else {
    // Optional: Default/Sample Data if nothing exists
    AppState.students = [];
  }
  refreshAllUI();
  console.log("Synced with LocalStorage");
}

// 2. SAVE Data (Replaces POST /students)
function saveStudentToStorage(student) {
  // Logic: "Upsert" - Update if exists, else Add
  const existingIndex = AppState.students.findIndex(s => s.roll_no === student.roll_no);
  
  if (existingIndex >= 0) {
    // Preserve attendance if not explicitly changing it, unless it's a new overwrite
    const oldStudent = AppState.students[existingIndex];
    if(student.attendance === "Not Marked") {
        student.attendance = oldStudent.attendance; 
    }
    AppState.students[existingIndex] = student;
  } else {
    AppState.students.push(student);
  }

  // Sort by Roll No (like Python did)
  AppState.students.sort((a, b) => a.roll_no.localeCompare(b.roll_no));

  commitToLocalStorage();
}

// 3. DELETE Data (Replaces DELETE /students)
function deleteStudentFromStorage(roll_no) {
  AppState.students = AppState.students.filter(s => s.roll_no !== roll_no);
  commitToLocalStorage();
}

// Helper to write to browser memory
function commitToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.students));
  refreshAllUI();
}

// ==================== AUTHENTICATION (PURE JS) ====================
function authenticateUserLocal(username, password) {
  // Simulate API Delay for realism
  return new Promise((resolve) => {
    setTimeout(() => {
      // 1. Faculty Check
      if (FACULTY_CREDENTIALS[username] && FACULTY_CREDENTIALS[username] === password) {
        resolve({ success: true, role: "Faculty", username: username });
        return;
      }
      
      // 2. Student Check
      if (STUDENT_CREDENTIALS[username] && STUDENT_CREDENTIALS[username] === password) {
        // Find existing data for this student
        const studentData = AppState.students.find(s => s.name.toUpperCase() === username);
        const roll_no = studentData ? studentData.roll_no : "UNKNOWN";
        
        resolve({ success: true, role: "Student", username: username, roll_no: roll_no });
        return;
      }

      resolve({ success: false, error: "Invalid credentials" });
    }, 500);
  });
}

function login(username, role, roll_no = null) {
  AppState.user = username;
  AppState.role = role;
  AppState.previewMode = false;

  if (role === "Faculty") {
    showScreen("faculty-portal");
    DOM.facultyName.textContent = username;
  } else {
    // Refresh data to ensure we have latest
    loadDataFromStorage();
    const student = AppState.students.find((s) => s.roll_no === roll_no);
      AppState.currentStudentView = student || {
        name: username,
        roll_no: roll_no || "N/A",
        marks: [],
        total_marks: 0,
        percentage: 0,
        grade: "Fail",
        attendance: "Not Marked",
      };
      showScreen("student-portal");
      updateStudentView();
  }
  showToast(`${role} login successful`, "success");
}

function logout() {
  AppState.user = null;
  AppState.role = null;
  AppState.previewMode = false;
  // We do NOT clear AppState.students here because we want data to persist
  // Just reset the view
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById("login-screen").classList.add("active");

  if (DOM.loginForm) DOM.loginForm.reset();
  showToast("Logged out successfully", "success");
}

function enterPreviewMode() {
  if (AppState.role !== "Faculty") return;
  AppState.previewMode = true;
  AppState.currentStudentView =
    AppState.students[0] || new Student("Sample", "000");
  showScreen("student-portal");
  DOM.previewBadge.classList.remove("hidden");
  document.getElementById("btn-exit-preview").classList.remove("hidden");
  document.getElementById("student-settings-nav").classList.add("hidden");
  updateStudentView();
}

function exitPreviewMode() {
  AppState.previewMode = false;
  AppState.currentStudentView = null;
  DOM.previewBadge.classList.add("hidden");
  document.getElementById("btn-exit-preview").classList.add("hidden");
  document.getElementById("student-settings-nav").classList.remove("hidden");
  showScreen("faculty-portal");
}

// ==================== SCREEN MANAGEMENT ====================
function showScreen(screenId) {
  document
    .querySelectorAll(".screen")
    .forEach((screen) => screen.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
}

// ==================== STUDENT CRUD ====================
function addStudent(payload) {
  requireFaculty("Add Student");
  if (isReadOnly()) return showToast("Cannot modify in preview mode", "error");

  const student = new Student(payload.name, payload.roll_no);
  student.marks = payload.marks || [];
  student.attendance = "Not Marked"; // Default
  student.calculateResult();

  saveStudentToStorage(student); // Call Local function
  showToast("New student added", "success");
}

function updateStudent(roll_no, payload) {
  requireFaculty("Update Student");
  if (isReadOnly()) return showToast("Cannot modify in preview mode", "error");

  const existing = AppState.students.find((s) => s.roll_no === roll_no);
  if (!existing) return;

  const student = new Student(payload.name || existing.name, roll_no);
  student.marks = payload.marks || existing.marks;
  student.attendance = existing.attendance;
  student.calculateResult();

  saveStudentToStorage(student); // Call Local function
  showToast("Student updated successfully", "success");
}

function handleDeleteStudent(roll_no) {
  requireFaculty("Delete Student");
  if (isReadOnly()) return showToast("Cannot delete in preview mode", "error");

  deleteStudentFromStorage(roll_no); // Call Local function
  showToast("Student record deleted", "success");
}

// ==================== ATTENDANCE ====================
function markAttendance(roll_no, status) {
  requireFaculty("Mark Attendance");
  if (isReadOnly()) return showToast("Cannot modify in preview mode", "error");

  const student = AppState.students.find((s) => s.roll_no === roll_no);
  if (!student) throw new Error("Student not found");

  AppState.attendanceStack.push({
    roll_no: roll_no,
    previous: student.attendance,
  });

  student.attendance = status;
  saveStudentToStorage(student); // Update storage
  showToast("Attendance updated", "success");
}

function undoAttendance() {
  requireFaculty("Undo Attendance");
  if (isReadOnly()) return showToast("Cannot modify in preview mode", "error");
  if (AppState.attendanceStack.length === 0)
    return showToast("Nothing to undo", "error");

  const lastAction = AppState.attendanceStack.pop();
  const student = AppState.students.find(
    (s) => s.roll_no === lastAction.roll_no,
  );

  if (student) {
    student.attendance = lastAction.previous;
    saveStudentToStorage(student); // Update storage
    showToast("Action undone", "success");
  }
}

// ==================== UTILITY & UI HELPERS ====================
function requireFaculty(actionName) {
  if (AppState.role !== "Faculty") {
    showToast(`Permission denied: ${actionName}`, "error");
    throw new Error("Unauthorized action");
  }
}
function isReadOnly() {
  return AppState.previewMode === true;
}

function refreshAllUI() {
  refreshStudentTable();
  refreshAttendanceSelect();
  refreshClassTree();
  refreshStats();
  refreshAnalytics();
  refreshUndoButton();
}
function refreshStudentTable() {
  if (!DOM.studentTableBody) return;

  if (AppState.students.length === 0) {
    DOM.studentTableBody.innerHTML = "";
    DOM.emptyTableMessage.classList.remove("hidden");
    return;
  }

  DOM.emptyTableMessage.classList.add("hidden");

  DOM.studentTableBody.innerHTML = AppState.students
    .map((student) => {
      const marksDisplay =
        student.marks && student.marks.length > 0
          ? student.marks.join(", ")
          : "<span style='color:#bbb; font-style:italic'>No Subjects</span>";

      return `
        <tr>
          <td>${escapeHtml(student.roll_no)}</td>
          <td><strong>${escapeHtml(student.name)}</strong></td>
          <td><span class="grade-badge ${getGradeClass(student.grade)}">${student.grade}</span></td>
          
          <td>${marksDisplay}</td>
          
          <td>${student.total_marks}</td>
          <td>${student.percentage.toFixed(1)}%</td>
          <td class="${getAttendanceClass(student.attendance)}">${student.attendance}</td>
          <td>
            <button class="btn btn-destructive btn-small" onclick="handleDeleteStudent('${student.roll_no}')">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");
}
function refreshAttendanceSelect() {
  if (!DOM.attendanceSelect) return;
  DOM.attendanceSelect.innerHTML =
    '<option value="">Select Student</option>' +
    AppState.students
      .map(
        (s) =>
          `<option value="${s.roll_no}">${s.roll_no} - ${escapeHtml(s.name)}</option>`,
      )
      .join("");
}

function refreshClassTree() {
  if (!DOM.classTreeDisplay) return;
  const tree = `Class : LATERAL ENTRY - Section - 2\n------------------------------------\n${AppState.students.map((s) => `--${s.roll_no} : ${s.name}--`).join("\n")}\n------------------------------------`;
  DOM.classTreeDisplay.textContent = tree;
}

function refreshStats() {
  if (!DOM.statTotal) return;
  const total = AppState.students.length;
  const present = AppState.students.filter(
    (s) => s.attendance === "Present",
  ).length;
  const avgScore =
    total > 0
      ? (
          AppState.students.reduce((sum, s) => sum + s.percentage, 0) / total
        ).toFixed(1)
      : 0;
  DOM.statTotal.textContent = total;
  DOM.statPresent.textContent = present;
  DOM.statAverage.textContent = `${avgScore}%`;
}

function refreshAnalytics() {
  if (!DOM.analyticsTotal) return;
  const total = AppState.students.length;
  const present = AppState.students.filter(
    (s) => s.attendance === "Present",
  ).length;
  const passing = AppState.students.filter((s) => s.grade !== "Fail").length;
  const avgScore =
    total > 0
      ? (
          AppState.students.reduce((sum, s) => sum + s.percentage, 0) / total
        ).toFixed(1)
      : 0;
  const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(0) : 0;
  const passRate = total > 0 ? ((passing / total) * 100).toFixed(0) : 0;
  DOM.analyticsTotal.textContent = total;
  DOM.analyticsAverage.textContent = total > 0 ? `${avgScore}%` : "N/A";
  DOM.analyticsAttendance.textContent =
    total > 0 ? `${attendanceRate}%` : "N/A";
  DOM.analyticsPass.textContent = total > 0 ? `${passRate}%` : "N/A";
  renderGradeChart();
  renderAttendanceChart();
  renderPerformersChart();
}

function refreshUndoButton() {
  if (DOM.undoCount)
    DOM.undoCount.textContent = AppState.attendanceStack.length;
}

function updateStudentView() {
  const student = AppState.currentStudentView;
  if (!student) return;
  DOM.studentDisplayName.textContent = student.name;
  DOM.reportName.textContent = student.name;
  DOM.reportRoll.textContent = `Roll No: ${student.roll_no}`;
  DOM.reportGrade.textContent = student.grade;
  DOM.reportGrade.className = `grade-pill ${getGradePillClass(student.grade)}`;
  DOM.reportPercentage.textContent = `${student.percentage.toFixed(1)}%`;
  DOM.reportTotal.textContent = student.total_marks;
  DOM.reportAttendance.textContent = student.attendance;
  DOM.reportAttendance.className = `stat-value ${getAttendanceStatClass(student.attendance)}`;
  if (student.marks && student.marks.length > 0) {
    DOM.reportMarksList.innerHTML = student.marks
      .map(
        (mark, index) =>
          `<li><span class="subject-name">Subject ${index + 1}</span><span class="subject-mark">${mark}</span></li>`,
      )
      .join("");
    DOM.noMarksMessage.classList.add("hidden");
  } else {
    DOM.reportMarksList.innerHTML = "";
    DOM.noMarksMessage.classList.remove("hidden");
  }
}

// ==================== CHART RENDERING ====================
function renderGradeChart() {
  if (!DOM.gradeChart) return;
  const grades = { A: 0, B: 0, C: 0, D: 0, Fail: 0 };
  AppState.students.forEach((s) => {
    if (grades[s.grade] !== undefined) grades[s.grade]++;
  });
  const total = AppState.students.length;
  if (total === 0) {
    DOM.gradeChart.innerHTML = '<p class="chart-empty">No data available</p>';
    return;
  }
  const colors = {
    A: "hsl(142, 76%, 36%)",
    B: "hsl(239, 84%, 67%)",
    C: "hsl(38, 92%, 50%)",
    D: "hsl(215, 16%, 65%)",
    Fail: "hsl(0, 84%, 60%)",
  };
  let gradientParts = [],
    currentAngle = 0;
  for (const [grade, count] of Object.entries(grades)) {
    if (count > 0) {
      const angle = (count / total) * 360;
      gradientParts.push(
        `${colors[grade]} ${currentAngle}deg ${currentAngle + angle}deg`,
      );
      currentAngle += angle;
    }
  }
  const gradient =
    gradientParts.length > 0
      ? `conic-gradient(${gradientParts.join(", ")})`
      : "conic-gradient(#ddd 0deg 360deg)";
  const legendItems = Object.entries(grades)
    .filter(([_, c]) => c > 0)
    .map(
      ([g, c]) =>
        `<span class="legend-item"><span class="legend-color" style="background-color: ${colors[g]}"></span>${g}: ${c}</span>`,
    )
    .join("");
  DOM.gradeChart.innerHTML = `<div class="pie-chart" style="background: ${gradient}"></div><div class="chart-legend">${legendItems}</div>`;
}

function renderAttendanceChart() {
  if (!DOM.attendanceChart) return;
  const attendance = { Present: 0, Absent: 0, "Not Marked": 0 };
  AppState.students.forEach((s) => {
    if (attendance[s.attendance] !== undefined) attendance[s.attendance]++;
  });
  const total = AppState.students.length;
  if (total === 0) {
    DOM.attendanceChart.innerHTML =
      '<p class="chart-empty">No data available</p>';
    return;
  }
  const colors = {
    Present: "hsl(142, 76%, 36%)",
    Absent: "hsl(0, 84%, 60%)",
    "Not Marked": "hsl(215, 16%, 65%)",
  };
  let gradientParts = [],
    currentAngle = 0;
  for (const [status, count] of Object.entries(attendance)) {
    if (count > 0) {
      const angle = (count / total) * 360;
      gradientParts.push(
        `${colors[status]} ${currentAngle}deg ${currentAngle + angle}deg`,
      );
      currentAngle += angle;
    }
  }
  const gradient =
    gradientParts.length > 0
      ? `conic-gradient(${gradientParts.join(", ")})`
      : "conic-gradient(#ddd 0deg 360deg)";
  const legendItems = Object.entries(attendance)
    .filter(([_, c]) => c > 0)
    .map(
      ([s, c]) =>
        `<span class="legend-item"><span class="legend-color" style="background-color: ${colors[s]}"></span>${s}: ${c}</span>`,
    )
    .join("");
  DOM.attendanceChart.innerHTML = `<div class="pie-chart" style="background: ${gradient}"></div><div class="chart-legend">${legendItems}</div>`;
}

function renderPerformersChart() {
  if (!DOM.performersChart) return;
  if (AppState.students.length === 0) {
    DOM.performersChart.innerHTML =
      '<p class="chart-empty">Add students to see analytics</p>';
    return;
  }
  const topPerformers = [...AppState.students]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
  DOM.performersChart.innerHTML = topPerformers
    .map(
      (s) =>
        `<div class="performer-bar"><span class="performer-name">${escapeHtml(s.name)}</span><div class="performer-bar-container"><div class="performer-bar-fill" style="width: ${s.percentage}%"></div></div><span class="performer-value">${s.percentage.toFixed(1)}%</span></div>`,
    )
    .join("");
}

// ==================== EVENT HANDLERS & LISTENERS ====================
function handleLogin(e) {
  e.preventDefault();
  const username = DOM.loginUsername.value.trim().toUpperCase(); // Changed to UpperCase to match keys
  const password = DOM.loginPassword.value.trim();
  DOM.usernameError.textContent = "";
  DOM.passwordError.textContent = "";
  if (!username) {
    DOM.usernameError.textContent = "Required";
    return;
  }
  if (!password) {
    DOM.passwordError.textContent = "Required";
    return;
  }

  // UPDATED: Call the local function
  authenticateUserLocal(username, password).then((result) => {
    if (result.success) {
      login(result.username, result.role, result.roll_no);
    } else {
      showToast(result.error, "error");
    }
  });
}

function handleStudentFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("student-name").value.trim();
  const roll = document.getElementById("student-roll").value.trim();
  const markInputs = document.querySelectorAll(".subject-mark");
  const marks = Array.from(markInputs).map(
    (input) => parseInt(input.value) || 0,
  );

  const existingStudent = AppState.students.find((s) => s.roll_no === roll);
  if (existingStudent) updateStudent(roll, { name, marks });
  else addStudent({ name, roll_no: roll, marks });

  DOM.studentForm.reset();
  DOM.marksContainer.innerHTML = "";
  subjectCount = 0;
}

function handleAttendanceSubmit(e) {
  e.preventDefault();
  const roll = DOM.attendanceSelect.value;
  const statusInput = document.querySelector(
    'input[name="attendance-status"]:checked',
  );
  if (roll && statusInput) {
    markAttendance(roll, statusInput.value);
    DOM.attendanceForm.reset();
  } else {
    showToast("Please select student and status", "error");
  }
}

function handleFacultyTabChange(btn) {
  document
    .querySelectorAll("#faculty-portal .nav-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document
    .querySelectorAll("#faculty-portal .tab-content")
    .forEach((c) => c.classList.remove("active"));
  document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  const titles = {
    dashboard: "Student Dashboard",
    manage: "Manage Students",
    attendance: "Attendance Management",
    analytics: "Analytics & Reports",
  };
  DOM.facultyTabTitle.textContent = titles[btn.dataset.tab] || "Dashboard";
}
function handleStudentTabChange(btn) {
  document
    .querySelectorAll("#student-portal .nav-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document
    .querySelectorAll("#student-portal .tab-content")
    .forEach((c) => c.classList.remove("active"));
  document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
}

let subjectCount = 0;
function handleAddSubject() {
  subjectCount++;
  const div = document.createElement("div");
  div.className = "mark-input-row";
  div.innerHTML = `<input type="number" class="form-input subject-mark" placeholder="Subject ${subjectCount} Marks" required><button type="button" class="btn btn-destructive mark-remove-btn" onclick="removeSubject(this)">X</button>`;
  DOM.marksContainer.appendChild(div);
}
function removeSubject(btn) {
  btn.closest(".mark-input-row").remove();
}
function handleUndo() {
  undoAttendance();
}

function setupEventListeners() {
  DOM.loginForm.addEventListener("submit", handleLogin);
  document
    .querySelectorAll("#faculty-portal .nav-btn[data-tab]")
    .forEach((btn) =>
      btn.addEventListener("click", () => handleFacultyTabChange(btn)),
    );
  DOM.studentForm.addEventListener("submit", handleStudentFormSubmit);
  document
    .getElementById("add-subject-btn")
    .addEventListener("click", handleAddSubject);
  DOM.attendanceForm.addEventListener("submit", handleAttendanceSubmit);
  DOM.undoBtn.addEventListener("click", handleUndo);

  // EXPLICIT LOGOUT HANDLERS
  document.getElementById("faculty-logout").addEventListener("click", logout);
  document.getElementById("student-logout").addEventListener("click", logout);

  document
    .querySelectorAll("#student-portal .nav-btn[data-tab]")
    .forEach((btn) =>
      btn.addEventListener("click", () => handleStudentTabChange(btn)),
    );
}

// ==================== GLOBAL HELPERS ====================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slide-out 0.4s ease forwards";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
function getGradeClass(g) {
  return (
    {
      A: "grade-a",
      B: "grade-b",
      C: "grade-c",
      D: "grade-d",
      Fail: "grade-fail",
    }[g] || "grade-fail"
  );
}
function getGradePillClass(g) {
  return (
    {
      A: "grade-a-bg",
      B: "grade-b-bg",
      C: "grade-c-bg",
      D: "grade-d-bg",
      Fail: "grade-fail-bg",
    }[g] || "grade-fail-bg"
  );
}
function getAttendanceClass(s) {
  return (
    {
      Present: "attendance-present",
      Absent: "attendance-absent",
      "Not Marked": "attendance-not-marked",
    }[s] || "attendance-not-marked"
  );
}
function getAttendanceStatClass(s) {
  return s === "Present"
    ? "stat-success"
    : s === "Absent"
      ? "stat-destructive"
      : "";
}

window.handleDeleteStudent = handleDeleteStudent;
window.removeSubject = removeSubject;
document.addEventListener("DOMContentLoaded", init);
