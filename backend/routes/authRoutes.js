const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const oAuth2Client = require("../config/googleAuth");

// 🔹 Login route
router.get("/google", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // 🔥 VERY IMPORTANT (FIX)
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });

  res.redirect(url);
});

// 🔹 Callback route
router.get("/google/callback", async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);

    const tokenPath = path.join(__dirname, "../token.json");

    fs.writeFileSync(tokenPath, JSON.stringify(tokens));

    console.log("✅ TOKEN SAVED & LOADED");

    res.send("Google Auth Successful");
  } catch (error) {
    console.error("❌ AUTH ERROR:", error);
    res.send("Auth failed");
  }
});

module.exports = router;