const { createZoomMeeting } = require("../services/zoomService");
const { sendEmail } = require("../services/emailService");
const db = require("../config/db"); // ✅ SQLite

exports.bookSession = async (req, res) => {
  try {
    const { studentName, email, time, category } = req.body;

    // 1️⃣ Create meeting via Zoom
    const meetingDetails = await createZoomMeeting(studentName, time);
    const joinLink = meetingDetails.joinUrl;
    const startLink = meetingDetails.startUrl;

    // 2️⃣ Send email (using joinLink for student)
    // Send to the student's email provided, fallback to studentName (if using older UI)
    const studentEmail = email || studentName;
    await sendEmail(studentEmail, studentName, time, time, joinLink);

    // 3️⃣ Extract date & time
    const date = time.split("T")[0];
    const onlyTime = time.split("T")[1].slice(0, 5);

    // 4️⃣ Save to SQLite (saving startLink for admin as well)
    db.run(
      `INSERT INTO bookings (name, email, category, date, time, meetLink)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentName, studentEmail, category, date, onlyTime, startLink],
      (err) => {
        if (err) {
          console.error("❌ SQLITE ERROR:", err);
        } else {
          console.log("💾 SAVED TO SQLITE");
        }
      }
    );

    res.json({
      success: true,
      meetLink: joinLink, // Return joinLink for the student
    });

  } catch (error) {
    console.error("❌ CONTROLLER ERROR:", error);
    res.status(500).json({ success: false });
  }
};

exports.checkAvailability = (req, res) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({ success: false, message: "Date and time required" });
  }

  // Check if slot is already booked
  db.get(
    `SELECT id FROM bookings WHERE date = ? AND time = ?`,
    [date, time],
    (err, row) => {
      if (err) {
        console.error("❌ SQLITE ERROR:", err);
        return res.status(500).json({ success: false });
      }

      if (row) {
        // Slot is booked
        return res.json({ available: false });
      } else {
        // Slot is available
        return res.json({ available: true });
      }
    }
  );
};