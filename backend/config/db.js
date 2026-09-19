const sqlite3 = require("sqlite3").verbose();
 
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("❌ DB ERROR:", err);
  } else {
    console.log("✅ SQLite Connected");
  }
});
 
// Create bookings table with Zoom fields
db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    meetLink TEXT,
    meetingId TEXT,
    meetingPassword TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
 
module.exports = db;
 