const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handleChat = async (req, res) => {
  try {
    const { message, history } = req.body;

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are a supportive, empathetic mental health chatbot for a college counseling system. 
Your goal is to offer a non-judgmental space for students to talk about their feelings, stress, and academic pressures. 
Keep your responses relatively brief, conversational, and warm. 
If a student expresses a need for professional consultation, severe distress, or just wants to talk to a counselor, gently encourage them to book a session. 
Tell them: "You can easily book a consultation session using the booking form right here on this page."
Do NOT try to provide professional medical advice, diagnosis, or treatment.`
    });

    // Format history for Gemini
    // Gemini expects history in the format: { role: "user" | "model", parts: [{text: "..."}] }
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({
      success: true,
      reply: responseText
    });

  } catch (error) {
    console.error("❌ CHAT ERROR:", error);
    res.status(500).json({ success: false, reply: "I'm sorry, I'm having trouble connecting right now. Please try again later." });
  }
};
