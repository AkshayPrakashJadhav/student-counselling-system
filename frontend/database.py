import sqlite3
 
DB_COUNSELING = "db/mental_health.db"
 
def init_counseling_db():
    conn = sqlite3.connect(DB_COUNSELING)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS counseling_sessions(
            session_id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            student_name TEXT,
            student_email TEXT,
            category TEXT,
            date TEXT,
            time TEXT,
            meet_link TEXT,
            meeting_id TEXT,
            meeting_password TEXT,
            status TEXT DEFAULT 'booked',
            follow_up INTEGER DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
 
def init_appointments_db():
    # Kept for backward compatibility
    pass
 
def get_all_appointments():
    conn = sqlite3.connect(DB_COUNSELING)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM counseling_sessions ORDER BY session_id DESC")
    data = cursor.fetchall()
    conn.close()
    return data
 
def get_available_slots():
    """Return list of already booked (date, time) pairs so frontend can disable them."""
    conn = sqlite3.connect(DB_COUNSELING)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT date, time FROM counseling_sessions WHERE status='booked'
    """)
    rows = cursor.fetchall()
    conn.close()
    return [{"date": r[0], "time": r[1]} for r in rows]
 