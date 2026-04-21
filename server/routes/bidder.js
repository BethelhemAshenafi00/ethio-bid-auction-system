const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const Auction = require("../models/Auction");
const mongoose = require("mongoose");

/* =======================
   BIDDER BIDS (MY BIDS)
======================= */
router.get("/bids/my", verifyToken, async (req, res) => {
  try {
    console.log("Bidder bids/my - user:", req.user);

    if (req.user.role !== "bidder") {
      return res.status(403).json({
        success: false,
        message: "Bidder access only"
      });
    }

    // ✅ FIX: Always use ObjectId
    const userId = new mongoose.Types.ObjectId(
      req.user.id || req.user._id
    );

    console.log("Querying with userId:", userId);

    const auctions = await Auction.find({
      "bids.bidder": userId
    })
      .populate("seller", "name email")
      .populate("highestBidder", "name email")
      .populate("bids.bidder", "name email")
      .sort({ endTime: -1 });

    // ✅ FIX: DEFINE now ONCE
    const now = new Date();

    const myBids = auctions.map((a) => {
      // ✅ SAFE: Check if bid.bidder exists before accessing _id
      const userBids = a.bids.filter(
        (bid) => bid && bid.bidder && bid.bidder._id && bid.bidder._id.toString() === userId.toString()
      );

      const latestBid = userBids[userBids.length - 1];

      const isEnded = new Date(a.endTime) <= now;
      const isActive = a.status === "approved" && new Date(a.endTime) > now;

      let bidStatus = "outbid";

      if (isEnded && a.highestBidder && a.highestBidder._id && a.highestBidder._id.toString() === userId.toString()) {
        bidStatus = "won";
      } else if (isEnded) {
        bidStatus = "lost";
      } else if (a.highestBidder && a.highestBidder._id && a.highestBidder._id.toString() === userId.toString()) {
        bidStatus = "leading";
      }

      return {
        _id: a._id,
        title: a.title,
        image: a.image,
        currentPrice: a.currentPrice,
        endTime: a.endTime,
        myBids: userBids,
        latestBid,
        isEnded,
        isActive,
        bidStatus
      };
    });

    res.json({
      success: true,
      data: myBids
    });

  } catch (err) {
    console.error("BIDS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =======================
   ACTIVE AUCTIONS 
======================= */
router.get("/active-auctions", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "bidder") {
      return res.status(403).json({
        success: false,
        message: "Bidder access only"
      });
    }

    const auctions = await Auction.find({
      status: "approved",
      endTime: { $gt: new Date() }
    })
      .populate("seller", "name email")
      .populate("highestBidder", "name email")
      .populate("bids.bidder", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: auctions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* =======================
   BIDDER: DELETE MY BID
======================= */
router.delete("/bids/:auctionId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "bidder") {
      return res.status(403).json({
        success: false,
        message: "Bidder access only"
      });
    }

    const mongoose = require("mongoose");

    const userId = new mongoose.Types.ObjectId(
      req.user.id || req.user._id
    );

    const auctionIdStr = req.params.auctionId;
    console.log('Delete bid auctionId received:', auctionIdStr, typeof auctionIdStr);
    
    if (!mongoose.Types.ObjectId.isValid(auctionIdStr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid auction ID format"
      });
    }

    const auctionId = new mongoose.Types.ObjectId(auctionIdStr);
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }

    // ❌ Prevent deleting if auction already ended
    if (new Date(auction.endTime) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete history after auction ended"
      });
    }

    // 🔥 Remove ONLY this user's bids
    const originalLength = auction.bids.length;

    auction.bids = auction.bids.filter(
      (bid) => !bid.bidder.equals(userId)
    );

    if (auction.bids.length === originalLength) {
      return res.status(404).json({
        success: false,
        message: "No bids found for this user"
      });
    }

    // ✅ Recalculate auction state
    if (auction.bids.length > 0) {
      const highest = auction.bids.sort((a, b) => b.amount - a.amount)[0];
      auction.currentPrice = highest.amount;
      auction.highestBidder = highest.bidder;
    } else {
      auction.currentPrice = auction.startingPrice;
      auction.highestBidder = null;
    }

    await auction.save();

    res.json({
      success: true,
      message: "Your bid history removed successfully"
    });

  } catch (err) {
    console.error("Delete history error:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =======================
   BIDDER WON AUCTIONS
======================= */
router.get("/won", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "bidder") {
      return res.status(403).json({ success: false, message: "Bidder only" });
    }

    const userId = new mongoose.Types.ObjectId(
      req.user.id || req.user._id
    );

    const wonAuctions = await Auction.find({
      highestBidder: userId,
      status: { $in: ["sold", "ended"] }
    })
      .populate("seller", "name email")
      .sort({ endTime: -1 });

    res.json({
      success: true,
      data: wonAuctions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =======================
   BIDDER STATS
======================= */
router.get("/stats", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "bidder") {
      return res.status(403).json({ success: false, message: "Bidder only" });
    }

    const userId = new mongoose.Types.ObjectId(
      req.user.id || req.user._id
    );

    const bidCount = await Auction.countDocuments({
      "bids.bidder": userId
    });

    const wonCount = await Auction.countDocuments({
      highestBidder: userId,
      status: { $in: ["sold", "ended"] }
    });

    const avgBidResult = await Auction.aggregate([
      { $match: { "bids.bidder": userId } },
      { $unwind: "$bids" },
      { $match: { "bids.bidder": userId } },
      {
        $group: {
          _id: null,
          avgAmount: { $avg: "$bids.amount" }
        }
      }
    ]);

    const avgBid = avgBidResult[0]?.avgAmount
      ? Math.round(avgBidResult[0].avgAmount)
      : 0;

    const watching = await Auction.countDocuments({
      "bids.bidder": userId,
      status: "approved",
      endTime: { $gt: new Date() }
    });

    res.json({
      success: true,
      data: {
        totalBids: bidCount,
        wonAuctions: wonCount,
        avgBid,
        watching
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;