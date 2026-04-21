const Auction = require("../models/Auction");
const { sendBidNotification } = require("../utils/email");

// Extracted from routes/auctions.js - get all active auctions
exports.getAllAuctions = async (req, res) => {
  try {
    // updateAuctionStatuses() logic can be moved to cron service later
    const auctions = await Auction.find({
      status: "approved",
      endTime: { $gt: new Date() }
    })
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: auctions.length,
      data: auctions
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add more controllers as needed (createAuction, placeBid etc.)

