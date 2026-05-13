const crypto = require("crypto");
const { sendTranscriptEmail } = require("../services/emailService");
const axios = require("axios");

// This assumes we have a function to get Zoom access token to download the transcript
// In zoomService.js we have getZoomAccessToken
// Let's require it if exported, or just copy the token logic or require it.
// We'll add getZoomAccessToken to exports in zoomService.js.
const { getZoomAccessToken } = require("../services/zoomService");

exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload;

    // 1️⃣ Zoom URL Validation Challenge
    if (event === "endpoint.url_validation") {
      const plainToken = payload.plainToken;
      const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

      if (!secretToken) {
         console.error("❌ NO ZOOM WEBHOOK SECRET TOKEN");
         return res.status(500).send("No secret token configured");
      }

      // Hash plainToken using HMAC SHA-256 and secretToken
      const hashForValidate = crypto.createHmac('sha256', secretToken).update(plainToken).digest('hex');

      return res.status(200).json({
        plainToken: plainToken,
        encryptedToken: hashForValidate
      });
    }

    // 2️⃣ Handle Transcript Completed Event
    if (event === "recording.transcript_completed" || event === "recording.completed") {
      console.log("📥 RECEIVED ZOOM RECORDING EVENT:", event);
      
      // The payload contains recording files
      const files = payload.object.recording_files;
      if (!files) return res.status(200).send("No files");

      // Find the transcript file (VTT or CSV)
      const transcriptFile = files.find(file => file.file_type === "VTT" || file.recording_type === "audio_transcript");

      if (transcriptFile) {
        const downloadUrl = transcriptFile.download_url;
        
        // Fetch the actual transcript file using Zoom Access Token
        const token = await getZoomAccessToken();
        const response = await axios.get(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const transcriptText = response.data;
        const meetingTopic = payload.object.topic;
        const meetingId = payload.object.id;

        // Send Email to Admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL; // fallback
        await sendTranscriptEmail(adminEmail, meetingTopic, transcriptText);

        console.log("✅ TRANSCRIPT DOWNLOADED AND EMAILED");
      } else {
        console.log("⚠️ NO TRANSCRIPT FILE FOUND IN EVENT");
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ WEBHOOK ERROR:", error);
    res.status(500).send("Server Error");
  }
};
