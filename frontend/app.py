from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import re
import sqlite3
import os
import requests
import base64
import database
 
app = Flask(__name__)
app.secret_key = os.urandom(24)
 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "db", "mental_health.db")
 
CORS(app, resources={r"/api/*": {"origins": "*"}})
 
# Zoom credentials (set these in your environment or .env)
ZOOM_ACCOUNT_ID = os.getenv("ZOOM_ACCOUNT_ID")
ZOOM_CLIENT_ID = os.getenv("ZOOM_CLIENT_ID")
ZOOM_CLIENT_SECRET = os.getenv("ZOOM_CLIENT_SECRET")
 
database.init_counseling_db()
 
 
# ------------------ DB ------------------
def get_db():
    return sqlite3.connect(DB_PATH)
 
 
# ------------------ ZOOM ------------------
def get_zoom_token():
    credentials = base64.b64encode(
        f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}".encode()
    ).decode()
 
    response = requests.post(
        f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={ZOOM_ACCOUNT_ID}",
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
    )
    return response.json().get("access_token")
 
 
def create_zoom_meeting(student_name, date, time):
    token = get_zoom_token()
 
    # Combine date + time into ISO format (IST)
    start_time = f"{date}T{time}:00+05:30"
 
    response = requests.post(
        "https://api.zoom.us/v2/users/me/meetings",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            "topic": f"Counseling Session - {student_name}",
            "type": 2,
            "start_time": start_time,
            "duration": 30,
            "timezone": "Asia/Kolkata",
            "settings": {
                "host_video": True,
                "participant_video": True,
                "waiting_room": True,
            }
        }
    )
 
    data = response.json()
    return {
        "join_url": data.get("join_url"),
        "meeting_id": str(data.get("id")),
        "password": data.get("password"),
    }
 
 
# ------------------ ROUTES ------------------
@app.route('/')
def chatbot():
    return render_template("chatbot_interface.html")
 
 
@app.route('/category')
def category():
    return render_template("category_selection.html")
 
 
@app.route('/calendar')
def calendar():
    category = request.args.get("category", "General")
    return render_template("calendar.html", category=category)
 
 
@app.route('/confirmation')
def confirmation():
    return render_template("confirmation.html")
 
 
@app.route('/admin')
def admin():
    key = request.args.get("key")
    if key != "admin123":
        return "Unauthorized", 403
    data = database.get_all_appointments()
    return render_template("admin.html", data=data)
 
 
# ------------------ API: Available slots ------------------
@app.route('/api/available-slots', methods=['GET'])
def available_slots():
    try:
        slots = database.get_available_slots()
        return jsonify(slots)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
 
# ------------------ API: Book session ------------------
@app.route('/api/book-session', methods=['POST'])
def book_session():
    try:
        data = request.get_json()
 
        student_id    = data.get("student_id", "").strip()
        student_name  = data.get("student_name", "").strip()
        student_email = data.get("student_email", "").strip()
        category      = data.get("category", "General").strip()
        date          = data.get("date", "").strip()
        time          = data.get("time", "").strip()
 
        # Validate
        if not all([student_id, student_name, student_email, date, time]):
            return jsonify({"success": False, "message": "Missing required fields"}), 400
 
        if not re.match(r"^1RN\d{2}[A-Z]{2}\d{3}$", student_id):
            return jsonify({"success": False, "message": "Invalid Student ID format"}), 400
 
        if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", student_email):
            return jsonify({"success": False, "message": "Invalid email address"}), 400
 
        conn = get_db()
        cursor = conn.cursor()
 
        # Check slot conflict
        cursor.execute("""
            SELECT * FROM counseling_sessions
            WHERE date=? AND time=? AND status='booked'
        """, (date, time))
 
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "message": "This slot is already booked. Please choose another."}), 400
 
        # Create Zoom meeting
        meeting = create_zoom_meeting(student_name, date, time)
 
        if not meeting.get("join_url"):
            conn.close()
            return jsonify({"success": False, "message": "Failed to create Zoom meeting"}), 500
 
        # Save to DB
        cursor.execute("""
            INSERT INTO counseling_sessions
            (student_id, student_name, student_email, category, date, time,
             meet_link, meeting_id, meeting_password, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'booked')
        """, (
            student_id, student_name, student_email, category,
            date, time,
            meeting["join_url"], meeting["meeting_id"], meeting["password"]
        ))
 
        conn.commit()
        session_id = cursor.lastrowid
        conn.close()
 
        return jsonify({
            "success": True,
            "session_id": session_id,
            "meet_link": meeting["join_url"],
            "meeting_id": meeting["meeting_id"],
            "password": meeting["password"],
            "date": date,
            "time": time,
            "category": category,
        })
 
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
 
 
# ------------------ API: Follow-up ------------------
@app.route('/api/book-followup', methods=['POST'])
def book_followup():
    try:
        data = request.get_json()
 
        student_id         = data.get("student_id", "").strip()
        previous_session_id = data.get("previous_session_id")
        date               = data.get("date", "").strip()
        time               = data.get("time", "").strip()
 
        if not all([student_id, previous_session_id, date, time]):
            return jsonify({"success": False, "message": "Missing fields"}), 400
 
        conn = get_db()
        cursor = conn.cursor()
 
        cursor.execute("""
            SELECT * FROM counseling_sessions
            WHERE session_id=? AND student_id=?
        """, (previous_session_id, student_id))
 
        previous = cursor.fetchone()
        if not previous:
            conn.close()
            return jsonify({"success": False, "message": "Previous session not found"}), 404
 
        student_name  = previous[2]
        student_email = previous[3]
        category      = previous[4]
 
        # Check slot conflict
        cursor.execute("""
            SELECT * FROM counseling_sessions
            WHERE date=? AND time=? AND status='booked'
        """, (date, time))
 
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "message": "Slot already booked"}), 400
 
        meeting = create_zoom_meeting(student_name, date, time)
 
        cursor.execute("""
            INSERT INTO counseling_sessions
            (student_id, student_name, student_email, category, date, time,
             meet_link, meeting_id, meeting_password, status, follow_up)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'booked', ?)
        """, (
            student_id, student_name, student_email, category,
            date, time,
            meeting["join_url"], meeting["meeting_id"], meeting["password"],
            previous_session_id
        ))
 
        conn.commit()
        conn.close()
 
        return jsonify({
            "success": True,
            "meet_link": meeting["join_url"],
            "meeting_id": meeting["meeting_id"],
            "password": meeting["password"],
        })
 
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
 
 
# ------------------ RUN ------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(debug=True, port=port)
 