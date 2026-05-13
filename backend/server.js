require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const zoomRoutes = require("./routes/zoomRoutes");

require("./config/db");

app.use(cors());
app.use(express.json());

app.use("/api", bookingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/zoom", zoomRoutes);
app.use("/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});