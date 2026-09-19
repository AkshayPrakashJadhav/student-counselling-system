const axios = require("axios");
 
async function getZoomAccessToken() {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");
 
  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {},
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
 
  return response.data.access_token;
}
 
async function createZoomMeeting(studentName, date, time) {
  const accessToken = await getZoomAccessToken();
 
  // Combine date + time into ISO format (IST = UTC+5:30)
  const startDateTime = new Date(`${date}T${time}:00+05:30`).toISOString();
 
  const response = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      topic: `Counseling Session - ${studentName}`,
      type: 2, // Scheduled meeting
      start_time: startDateTime,
      duration: 30,
      timezone: "Asia/Kolkata",
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        auto_recording: "none",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
 
  console.log("✅ ZOOM MEETING CREATED");
 
  return {
    joinUrl: response.data.join_url,
    meetingId: response.data.id,
    password: response.data.password,
  };
}
 
module.exports = { createZoomMeeting };
 