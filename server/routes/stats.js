const express = require("express");
const Auction = require("../models/Auction");
const User = require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const activeAuctions = await Auction.countDocuments({
      endTime: { $gt: new Date() },
    });

    const soldAuctions = await Auction.find({
      endTime: { $lte: new Date() },
    });

    const totalSold = soldAuctions.reduce(
      (sum, a) => sum + (a.currentPrice || 0),
      0
    );

    res.json({
      data: {
        totalUsers,
        activeAuctions,
        totalSold,
        uptime: 99,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
