const express = require("express");
const router = express.Router();

const { bookSession, checkAvailability } = require("../controllers/bookingController");
const db = require("../config/db"); // ✅ SQLite

// 🔹 GET availability
router.get("/check-availability", checkAvailability);

// 🔹 POST booking
router.post("/book-session", bookSession);

// 🔹 GET bookings (ADMIN PANEL)
router.get("/bookings", (req, res) => {
  db.all("SELECT * FROM bookings ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error("❌ DB ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

module.exports = router;