const nodemailer = require("nodemailer");
 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
 
async function sendEmail(studentEmail, studentName, date, time, meetLink, meetingPassword) {
  try {
    const mailOptions = {
      from: `"Student Counseling System" <${process.env.EMAIL}>`,
      to: studentEmail,
      subject: "✅ Counseling Session Confirmed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2d6be4;">Counseling Session Confirmed</h2>
          <p>Hello <strong>${studentName}</strong>,</p>
          <p>Your counseling session has been successfully scheduled.</p>
 
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; font-weight:bold;">📅 Date</td>
              <td style="padding:10px;">${date}</td>
            </tr>
            <tr>
              <td style="padding:10px; font-weight:bold;">⏰ Time</td>
              <td style="padding:10px;">${time} (IST)</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:10px; font-weight:bold;">🔒 Password</td>
              <td style="padding:10px;">${meetingPassword}</td>
            </tr>
          </table>
 
          <div style="text-align:center; margin: 24px 0;">
            <a href="${meetLink}" 
               style="background:#2d6be4; color:white; padding:12px 28px; border-radius:6px; text-decoration:none; font-size:16px;">
              Join Zoom Meeting
            </a>
          </div>
 
          <p style="color:#888; font-size:13px;">
            If the button doesn't work, copy this link:<br/>
            <a href="${meetLink}">${meetLink}</a>
          </p>
 
          <hr style="border:none; border-top:1px solid #eee; margin:24px 0;"/>
          <p style="color:#aaa; font-size:12px;">
            This is an automated message from the Student Counseling System.
            Please do not reply to this email.
          </p>
        </div>
      `,
    };
 
    await transporter.sendMail(mailOptions);
    console.log("📧 CONFIRMATION EMAIL SENT TO:", studentEmail);
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
  }
}
 
module.exports = sendEmail;
 