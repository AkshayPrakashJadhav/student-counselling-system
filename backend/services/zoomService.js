const axios = require('axios');

// Get Zoom Server-to-Server OAuth Token
async function getZoomAccessToken() {
    try {
        const accountId = process.env.ZOOM_ACCOUNT_ID;
        const clientId = process.env.ZOOM_CLIENT_ID;
        const clientSecret = process.env.ZOOM_CLIENT_SECRET;

        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
            {},
            {
                headers: {
                    'Authorization': `Basic ${authHeader}`
                }
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error("❌ ZOOM OAUTH ERROR:", error?.response?.data || error.message);
        throw new Error("Failed to get Zoom Access Token");
    }
}

// Create Zoom Meeting
async function createZoomMeeting(studentName, time) {
    console.log("📅 ZOOM FUNCTION CALLED");
    
    try {
        const token = await getZoomAccessToken();

        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                topic: `Counseling Session - ${studentName}`,
                type: 2, // Scheduled meeting
                start_time: new Date(time).toISOString(),
                duration: 30,
                timezone: "Asia/Kolkata",
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: false,
                    auto_recording: "cloud" // VERY IMPORTANT: Enables cloud recording for transcript
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("✅ ZOOM MEETING CREATED");
        
        return {
            joinUrl: response.data.join_url,
            startUrl: response.data.start_url, // Needed for admin to start meeting
            meetingId: response.data.id
        };
    } catch (error) {
        console.error("❌ ZOOM CREATE ERROR:", error?.response?.data || error.message);
        // Fallback for demonstration if credentials are not yet set
        if (!process.env.ZOOM_ACCOUNT_ID) {
            console.log("⚠️ NO ZOOM CREDENTIALS FOUND. RETURNING MOCK DATA.");
            return {
                joinUrl: "https://zoom.us/j/mock123?pwd=mock",
                startUrl: "https://zoom.us/s/mock123?zak=mock",
                meetingId: "mock123"
            };
        }
        throw error;
    }
}

module.exports = { createZoomMeeting, getZoomAccessToken };
