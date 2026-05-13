const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("❌ DB ERROR:", err);
  } else {
    console.log("✅ SQLite Connected");
  }
});

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    category TEXT,
    date TEXT,
    time TEXT,
    meetLink TEXT,
    transcript TEXT
  )
`);

// Try to add columns if table already exists
db.run("ALTER TABLE bookings ADD COLUMN category TEXT", (err) => { /* ignore if already exists */ });
db.run("ALTER TABLE bookings ADD COLUMN transcript TEXT", (err) => { /* ignore if already exists */ });

module.exports = db;