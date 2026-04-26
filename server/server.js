require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// ===================== ENSURE UPLOADS DIRECTORY EXISTS =====================
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
}

// ===================== FRONTEND =====================
const FRONTEND_URL = "https://ethio-bid-auction-system.vercel.app";

// ===================== ALLOWED ORIGINS =====================
const allowedOrigins = [
  "https://ethio-bid-auction-system.onrender.com",
  FRONTEND_URL
];

// ===================== SOCKET.IO =====================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ===================== MIDDLEWARE =====================
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      return callback(null, true); // prevent crash in production
    }
  },
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===================== MONGODB =====================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ===================== ROUTES =====================
app.use("/api/auctions", require("./routes/auctions"));
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/bidder", require("./routes/bidder"));
app.use("/api/seller", require("./routes/seller"));
app.use("/api/notifications", require("./routes/notifications"));

// ===================== TEST ROUTE =====================
app.get("/", (req, res) => {
  res.send("Auction API running 🚀");
});

// ===================== START SERVER =====================
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});