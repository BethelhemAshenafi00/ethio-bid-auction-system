const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

async function createAdmin() {
  try {
    await mongoose.connect("mongodb://localhost:27017/auctionDB");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Check if admin already exists (idempotent)
    let admin = await User.findOne({ email: "admin@mail.com" });
    if (admin) {
      console.log("✅ Admin already exists!");
      process.exit(0);
    }

    // Create admin if not exists
    admin = new User({
      name: "Admin",
      email: "admin@mail.com",
      phoneNumber: "0942154333", // required
      password: hashedPassword,
      role: "admin",
      isApproved: true
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

createAdmin();