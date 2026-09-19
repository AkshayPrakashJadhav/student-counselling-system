import sqlite3

conn = sqlite3.connect("db/database.db")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE appointments ADD COLUMN meet_link TEXT")
except:
    pass

conn.commit()
conn.close()

print("Updated successfully")