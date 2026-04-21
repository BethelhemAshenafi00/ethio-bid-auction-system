const express = require("express");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();
const User = require("../models/User");

// 🔒 Protect all routes
router.use(verifyToken);

// 👮 Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

/* =======================
   ADMIN: GET ALL USERS
======================= */

router.get("/", isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

/* =======================
   ADMIN: DELETE USER
======================= */
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

/* =======================
   ADMIN: TOGGLE APPROVE
======================= */
router.patch("/:id/approve", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isApproved = !user.isApproved;
    user.lastActivity = new Date();
    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Approve failed",
    });
  }
});

/* =======================
   ADMIN: TOGGLE BLOCK
======================= */
router.patch("/:id/block", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = !user.isBlocked;
    user.lastActivity = new Date();
    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("BLOCK ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Block failed",
    });
  }
});

/* =======================
   USER: GET PROFILE
======================= */
router.get("/profile/me", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =======================
   USER: UPDATE PROFILE
======================= */
router.put("/profile/me", async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phoneNumber },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

/* =======================
   USER: CHANGE PASSWORD
======================= */
router.put("/change-password", async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("PASSWORD ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;