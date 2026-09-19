import sqlite3

# Connect to the counseling database
conn = sqlite3.connect("db/mental_health.db")
cursor = conn.cursor()

# Add follow_up column if it doesn't exist
try:
    cursor.execute("ALTER TABLE counseling_sessions ADD COLUMN follow_up TEXT")
    print("Follow-up column added successfully!")
except sqlite3.OperationalError:
    print("Column already exists. Nothing to do.")

conn.commit()
conn.close()