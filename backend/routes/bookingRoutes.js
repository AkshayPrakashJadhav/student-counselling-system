const express = require("express");
const router = express.Router();
const { bookSession, getBookedSlots } = require("../controllers/bookingController");
const db = require("../config/db");
 
// 🔹 POST - Book a session
router.post("/book-session", bookSession);
 
// 🔹 GET - Booked slots (used by frontend slot picker to disable taken slots)
router.get("/booked-slots", getBookedSlots);
 
// 🔹 GET - All bookings (admin panel)
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