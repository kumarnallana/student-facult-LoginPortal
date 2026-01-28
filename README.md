# 🎓 Kite Academic Portal

A full-stack Student & Faculty Management System built with **Python (Flask)**, **MongoDB**, and **Vanilla JavaScript**. This portal allows faculty to manage students, marks, and attendance, while providing analytics and detailed reports.

---

## 🚀 Features

### 👨‍🏫 Faculty Portal

- **Dashboard:** View all students with detailed breakdowns of subject marks, grades, and attendance.
- **Student Management:** Add, Update, and Delete student records.
- **Marks Entry:** specific marks for multiple subjects (automatically calculates Total, %, and Grade).
- **Attendance System:** Mark students as Present/Absent with an "Undo" feature.
- **Analytics:** Visual charts for Grade Distribution, Attendance Overview, and Top Performers.
- **Class Tree:** Hierarchical view of the class list.

### 👨‍🎓 Student Portal

- **Personal Report:** View own marks, percentage, grade, and attendance status.
- **Read-Only Access:** Secure view of personal academic data.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Custom Design System), JavaScript (ES6+).
- **Backend:** Python 3, Flask (Web Framework).
- **Database:** MongoDB (NoSQL Database).
- **Communication:** REST API (Fetch API & JSON).

---

## 📂 Project Structure

```text
KiteProject/
│
├── backend/
│   ├── server.py                # Main Flask API Server
│   └── student_management.py    # (Optional) Standalone CLI version
│
├── frontend/
│   ├── index.html               # Main Dashboard & Login Interface
│   ├── Student_Teacher_Managment1.css  # Styling & Themes
│   └── Student_Teacher_Managment1.js   # Frontend Logic & API Connection
│
└── README.md                    # Project Documentation
```
