const { google } = require("googleapis");
const oAuth2Client = require("../config/googleAuth");

const calendar = google.calendar({
  version: "v3",
  auth: oAuth2Client, // ✅ VERY IMPORTANT
});

async function createMeeting(studentName, time) {
  console.log("📅 GOOGLE FUNCTION CALLED");

  const event = {
    summary: "Student Counseling Session",
    description: `Student: ${studentName}`,
    start: {
      dateTime: time,
      timeZone: "Asia/Kolkata",
    },
    end: {
      dateTime: new Date(new Date(time).getTime() + 30 * 60000),
      timeZone: "Asia/Kolkata",
    },
    conferenceData: {
      createRequest: {
        requestId: Date.now().toString(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  console.log("✅ MEETING CREATED");

  return response.data.hangoutLink;
}

module.exports = { createMeeting };