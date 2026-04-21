require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;



// Socket.io setup
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});

app.set("io", io); // make io accessible in routes

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("register", (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined room`);
  });
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

// Middleware
app.use(cors({ origin: "http://localhost:3000", methods: ["GET","POST","PUT","DELETE","PATCH"] }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection - FIXED invalid URI
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/auctionDB")
.then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));


// Routes
const auctionRoutes = require("./routes/auctions");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");
const statsRoutes = require("./routes/stats");
const bidderRoutes = require("./routes/bidder");
const notificationRoutes = require("./routes/notifications");

app.use("/api/auctions", auctionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/bidder", bidderRoutes);
app.use("/api/seller", require("./routes/seller"));
app.use("/api/notifications", notificationRoutes);

// Test route
app.get("/", (req, res) => res.send("Auction API running"));
app.get("/test-mailtrap", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: "test@auction.com",
      to: "test@example.com",
      subject: "Mailtrap Test",
      text: "Hello from Mailtrap 🚀",
    });

    console.log("MAILTRAP SUCCESS:", info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.log("MAILTRAP ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

