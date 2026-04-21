const express = require("express");
const router = express.Router();

const Auction = require("../models/Auction");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { verifyToken } = require("../middleware/auth");

/* =======================
   ADMIN MIDDLEWARE
======================= */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }

  next();
};

/* =======================
   APPLY GLOBAL MIDDLEWARE
======================= */
router.use(verifyToken, isAdmin);

/* =======================
   USERS
======================= */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

const { sendApprovalEmail } = require("../utils/email");

router.patch("/users/:id/approve", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('seller', 'name email');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }



    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Approve failed" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

/* =======================
   AUCTIONS
======================= */
router.get("/auctions/all", async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate("seller", "name email")
      .populate("bids.bidder", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: auctions.length, data: auctions });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch auctions" });
  }
});

router.get("/auctions/pending", async (req, res) => {
  try {
    const auctions = await Auction.find({ status: "pending" })
      .populate("seller", "name email");

    res.json({ success: true, data: auctions });
  } catch {
    res.status(500).json({ success: false });
  }
});

router.patch("/auctions/:id/approve", async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).populate("seller", "name email");

    if (auction.seller && auction.seller.email) {
      const { sendEmail } = require("../utils/email");
      await sendEmail(
        auction.seller.email,
        `Auction "${auction.title}" Approved`,
        `<p>Your auction <strong>${auction.title}</strong> is now live!</p>`,
        auction.seller._id,
        "AUCTION_APPROVED",
        auction._id
      );
    }

    res.json({ success: true, data: auction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.patch("/auctions/:id/reject", async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate("seller", "name email");

    if (auction.seller && auction.seller.email) {
      const { sendEmail } = require("../utils/email");
      await sendEmail(
        auction.seller.email,
        `Auction "${auction.title}" Rejected`,
        `<p>Your auction <strong>${auction.title}</strong> has been rejected by admin.</p>`,
        auction.seller._id,
        "AUCTION_REJECTED",
        auction._id
      );
    }

    res.json({ success: true, data: auction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.delete("/auctions/:id", async (req, res) => {
  try {
    const auction = await Auction.findByIdAndDelete(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: "Auction not found" });
    }

    res.json({ success: true, message: "Auction deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

/* =======================
   BIDS
======================= */
router.get("/bids", async (req, res) => {
  try {
    const auctions = await Auction.find({ "bids.0": { $exists: true } })
      .populate("bids.bidder", "name email");

    const bids = auctions.flatMap((a) =>
      a.bids.map((b) => ({
        auctionId: a._id,
        auctionTitle: a.title,
        bidder: b.bidder,
        amount: b.amount,
        timestamp: b.timestamp,
      }))
    );

    res.json({ success: true, data: bids });
  } catch {
    res.status(500).json({ success: false });
  }
});

router.delete("/bids/:auctionId/:bidderId", async (req, res) => {
  try {
    const { auctionId, bidderId } = req.params;

    const auction = await Auction.findById(auctionId).populate('bids.bidder');
    if (!auction) {
      return res.status(404).json({ success: false });
    }

    const before = auction.bids.length;

    auction.bids = auction.bids.filter(
      (b) => !b.bidder._id.equals(bidderId)
    );

    if (auction.bids.length === before) {
      return res.status(404).json({ success: false });
    }

    await auction.save();

    res.json({ success: true, message: "Bid deleted" });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* =======================
   PAYMENTS
======================= */
router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("auction")
      .populate("bidder", "name email");

    res.json({ success: true, data: payments });
  } catch {
    res.status(500).json({ success: false });
  }
});

router.delete("/payments/:id", async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch {
    res.status(500).json({ success: false });
  }
});

/* =======================
   ACTIVITY (SIMPLE FIXED VERSION)
======================= */
router.get("/activity", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(10);

    const activity = users.map((u) => ({
      type: "user",
      action: "Registered",
      user: u.name,
      timestamp: u.createdAt,
    }));

    res.json({ success: true, recentActivity: activity });
  } catch {
    res.status(500).json({ success: false });
  }
});

module.exports = router;