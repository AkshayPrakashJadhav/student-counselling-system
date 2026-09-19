import sqlite3

# Connect to counseling database
conn = sqlite3.connect("db/mental_health.db")
cursor = conn.cursor()

# Fetch all sessions
cursor.execute("SELECT * FROM counseling_sessions")
rows = cursor.fetchall()

# Print each row
for row in rows:
    print(row)

conn.close()