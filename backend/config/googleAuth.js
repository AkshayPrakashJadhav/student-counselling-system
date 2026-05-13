const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, "oauth.json"))
);

const { client_id, client_secret, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// 🔥 Load token correctly
const tokenPath = path.join(__dirname, "../token.json");

if (fs.existsSync(tokenPath)) {
  const token = fs.readFileSync(tokenPath);
  oAuth2Client.setCredentials(JSON.parse(token));
  console.log("✅ TOKEN LOADED");
} else {
  console.log("❌ NO TOKEN FOUND");
}

module.exports = oAuth2Client;