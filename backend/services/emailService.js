const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail(studentEmail, studentName, date, time, meetLink) {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: "Counseling Meeting Confirmation",
      text: `Hello ${studentName},

Your counseling session is scheduled.

Date: ${date}
Time: ${time}

Join Meeting:
${meetLink}
`,
    };

    await transporter.sendMail(mailOptions);

    console.log("📧 EMAIL SENT SUCCESSFULLY");

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
  }
}

async function sendTranscriptEmail(adminEmail, meetingTopic, transcriptText) {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: adminEmail,
      subject: `Transcript: ${meetingTopic}`,
      text: `Hello,\n\nThe transcript for the meeting "${meetingTopic}" is ready.\n\nTranscript:\n${transcriptText}`,
    };
    await transporter.sendMail(mailOptions);
    console.log("📧 TRANSCRIPT EMAIL SENT SUCCESSFULLY");
  } catch (error) {
    console.error("❌ TRANSCRIPT EMAIL ERROR:", error);
  }
}

async function sendFeedbackEmail(emailAddress, role) {
  try {
    // Placeholder feedback link
    const feedbackLink = "https://forms.google.com/your-placeholder-link";
    const mailOptions = {
      from: process.env.EMAIL,
      to: emailAddress,
      subject: `Feedback Request: Counseling Session`,
      text: `Hello,\n\nWe hope the counseling session went well. Please provide your feedback using the following link:\n\n${feedbackLink}\n\nThank you!`,
    };
    await transporter.sendMail(mailOptions);
    console.log(`📧 FEEDBACK EMAIL SENT TO ${role}`);
  } catch (error) {
    console.error("❌ FEEDBACK EMAIL ERROR:", error);
  }
}

module.exports = { sendEmail, sendTranscriptEmail, sendFeedbackEmail };