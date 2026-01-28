import sys
import requests  # <--- REQUIRED FOR GITHUB FETCHING
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError
from flask import Flask, jsonify, request
from flask_cors import CORS

# ==========================
# 1. CONFIGURATION
# ==========================
DB_URI = "mongodb://localhost:27017/"
DB_NAME = "student_management"
COLLECTION_NAME = "students"

# ==========================
# 2. DATABASE CONNECTION
# ==========================
def connect_db():
    """Establishes a robust connection to MongoDB with timeout handling."""
    try:
        # 3-second timeout to fail fast if DB is down
        client = MongoClient(DB_URI, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        print("✔ Database connected successfully")
        return client[DB_NAME][COLLECTION_NAME]
    except ConnectionFailure:
        print("❌ CRITICAL: MongoDB connection failed. Is MongoDB running?")
        sys.exit(1)

student_collection = connect_db()

# ==========================
# 3. FLASK APP SETUP
# ==========================
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend

# ==========================
# 4. SECURITY (AUTHENTICATION)
# ==========================
FACULTY_CREDENTIALS = {
    "APARNA": "APARNA4508",
    "KUMARNALLANA": "KUMAR4505",
}

STUDENT_CREDENTIALS = {
    "HAIMA": "HAIMA4502",
    "DURGAPRASAD": "DURGA450x",
    "SHIVA": "SHIVA450x"
}

# ==========================
# 5. HELPER FUNCTIONS
# ==========================
def calculate_grade(percentage):
    """Determines grade based on percentage score."""
    if percentage >= 90: return "A"
    if percentage >= 75: return "B"
    if percentage >= 50: return "C"
    if percentage >= 35: return "D"
    return "Fail"

# ==========================
# 6. API ROUTES
# ==========================

@app.route('/login', methods=['POST'])
def login_route():
    """Handles secure authentication for Faculty and Students."""
    try:
        data = request.json
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        username = data.get("username", "").strip().upper()
        password = data.get("password", "").strip()
        
        # 1. Faculty Check
        if FACULTY_CREDENTIALS.get(username) == password:
            return jsonify({"success": True, "role": "Faculty", "username": username})
        
        # 2. Student Check
        if STUDENT_CREDENTIALS.get(username) == password:
            # Find student profile for dynamic linking
            student = student_collection.find_one({
                "name": {"$regex": f"^{username}$", "$options": "i"}
            })
            roll_no = student["roll_no"] if student else "UNKNOWN"
            return jsonify({"success": True, "role": "Student", "username": username, "roll_no": roll_no})

        return jsonify({"success": False, "error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"success": False, "error": f"Server Error: {str(e)}"}), 500

@app.route('/students', methods=['GET'])
def get_students():
    """Retrieves all students sorted by Roll No."""
    try:
        cursor = student_collection.find({}, {'_id': 0}).sort("roll_no", 1)
        students = list(cursor)
        return jsonify(students)
    except PyMongoError as e:
        return jsonify({"error": "Database error fetching students"}), 500

@app.route('/students', methods=['POST'])
def save_student():
    """
    Powerful Upsert: Creates new or Updates existing.
    Includes Validation, Math Safety, and Attendance Logging.
    """
    try:
        data = request.json
        name = data.get("name", "").strip()
        roll_no = data.get("roll_no", "").strip()

        # --- VALIDATION ---
        if not name or not roll_no:
            return jsonify({"success": False, "error": "Name and Roll No are required"}), 400

        # --- DATA CLEANING ---
        raw_marks = data.get("marks", [])
        try:
            marks = [int(m) for m in raw_marks]
        except (ValueError, TypeError):
            marks = []

        # --- CALCULATION ---
        total_marks = sum(marks)
        percentage = total_marks / len(marks) if marks else 0
        grade = calculate_grade(percentage)
        
        new_attendance_status = data.get("attendance", "Not Marked")

        # --- PREPARE DATA ---
        update_fields = {
            "name": name,
            "marks": marks,
            "total_marks": total_marks,
            "percentage": percentage,
            "grade": grade,
            "attendance": new_attendance_status
        }

        # --- SMART UPDATE ---
        result = student_collection.update_one(
            {"roll_no": roll_no},
            {
                "$set": update_fields,
                "$setOnInsert": {"created_at": datetime.now()}
            },
            upsert=True
        )
        
        action = "Created" if result.upserted_id else "Updated"
        return jsonify({"success": True, "message": f"Student {action} successfully"})

    except PyMongoError as e:
        return jsonify({"success": False, "error": "Database write failed"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/students/<roll_no>', methods=['DELETE'])
def delete_student(roll_no):
    """Permanently removes a student."""
    try:
        result = student_collection.delete_one({"roll_no": roll_no})
        if result.deleted_count > 0:
            return jsonify({"success": True, "message": "Student deleted"})
        else:
            return jsonify({"success": False, "message": "Student not found"}), 404
    except PyMongoError:
        return jsonify({"success": False, "error": "Database delete failed"}), 500

# ==========================
# GITHUB API INTEGRATION
# ==========================
@app.route('/github/<username>', methods=['GET'])
def get_github_profile(username):
    """
    Fetches public GitHub user data.
    """
    github_url = f"https://api.github.com/users/{username}"
    try:
        response = requests.get(github_url)
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": "GitHub user not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Kite Academic Server is running on http://localhost:5000")
    app.run(debug=True, port=5000)