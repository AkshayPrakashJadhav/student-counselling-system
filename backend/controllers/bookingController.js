const { createZoomMeeting } = require("../services/zoomService");
const sendEmail = require("../services/emailService");
const db = require("../config/db");
 
// 📅 Get all booked slots (for frontend slot picker)
exports.getBookedSlots = (req, res) => {
  db.all(
    "SELECT date, time FROM bookings",
    [],
    (err, rows) => {
      if (err) {
        console.error("❌ DB ERROR:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
};
 
// 📝 Book a session
exports.bookSession = async (req, res) => {
  try {
    const { studentName, studentEmail, date, time, category } = req.body;
 
    // Validate required fields
    if (!studentName || !studentEmail || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: studentName, studentEmail, date, time",
      });
    }
 
    // 1️⃣ Create Zoom meeting
    const meeting = await createZoomMeeting(studentName, date, time);
 
    // 2️⃣ Send confirmation email to student
    await sendEmail(studentEmail, studentName, date, time, meeting.joinUrl, meeting.password);
 
    // 3️⃣ Save to SQLite
    db.run(
      `INSERT INTO bookings (name, email, date, time, category, meetLink, meetingId, meetingPassword)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentName,
        studentEmail,
        date,
        time,
        category || "General",
        meeting.joinUrl,
        meeting.meetingId,
        meeting.password,
      ],
      (err) => {
        if (err) {
          console.error("❌ SQLITE ERROR:", err);
        } else {
          console.log("💾 BOOKING SAVED TO DB");
        }
      }
    );
 
    res.json({
      success: true,
      meetLink: meeting.joinUrl,
      meetingId: meeting.meetingId,
      password: meeting.password,
      date,
      time,
    });
  } catch (error) {
    console.error("❌ BOOKING ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Failed to create meeting" });
  }
};