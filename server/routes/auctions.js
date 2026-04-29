const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Auction = require("../models/Auction");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");
const { verifyToken } = require("../middleware/auth");

/* =======================
   AUTO STATUS UPDATE + WINNER NOTIFICATION
======================= */
const updateAuctionStatuses = async () => {
  try {
    // Update ended status
    const updated = await Auction.updateMany(
      {
        endTime: { $lt: new Date() },
        status: { $ne: "ended" }
      },
      { $set: { status: "ended" } }
    );

    console.log(`🔄 Updated ${updated.modifiedCount} auctions to "ended"`);

    // ✅ NEW: Find newly ended auctions with winners
    const endedAuctions = await Auction.find({
      endTime: { $lt: new Date() },
      status: "ended",
      highestBidder: { $ne: null }
    })
    .populate("highestBidder", "name email")
    .populate("seller", "name email paymentDetails");

    const Notification = require("../models/Notification");
    const User = require("../models/User");
    const { sendWinnerNotification } = require("../utils/email");

    for (const auction of endedAuctions) {
      // Create winner notification
      if (auction.highestBidder) {
        await Notification.create({
          user: auction.highestBidder._id,
          type: "AUCTION_WON",
          auction: auction._id,
          message: `🎉 You won "${auction.title}" for ETB ${auction.currentPrice.toLocaleString()}! Check payments.`,
        });

        // Email winner
        try {
          await sendWinnerNotification(
            auction.highestBidder.email,
            auction.highestBidder._id,
            auction.title,
            auction.seller.name,
            auction.currentPrice,
            auction._id
          );
          console.log(`📧 Winner notified: ${auction.highestBidder.email}`);
        } catch (emailErr) {
          console.error("Winner email failed:", emailErr.message);
        }

        // Socket (if connected) - skip in cron, handled in bidder routes
        console.log(`📱 Socket win notification ready for ${auction.highestBidder.email}`);
      }

      // Notify seller of winner + prompt payment details
      if (auction.seller) {
        await Notification.create({
          user: auction.seller._id,
          type: "AUCTION_ENDED",
          auction: auction._id,
          message: `🏆 "${auction.title}" ended! Winner: ${auction.highestBidder?.name || 'Bidder'} (ETB ${auction.currentPrice.toLocaleString()}). Update payment details & request payment.`,
        });

        // Email seller if no payment details
        if (!auction.seller.paymentDetails || Object.keys(auction.seller.paymentDetails).every(k => !auction.seller.paymentDetails[k])) {
          try {
            const { sendEmail } = require("../utils/email");
            await sendEmail(
              auction.seller.email,
              `📋 Payment Details Needed for "${auction.title}"`,
              `
                <h2>🏆 Auction Ended - Action Required</h2>
                <p><b>Winner:</b> ${auction.highestBidder?.name}</p>
                <p><b>Amount:</b> ETB ${auction.currentPrice.toLocaleString()}</p>
                <p><b>Add payment details:</b> Seller Dashboard → Settings</p>
              `,
              auction.seller._id,
              "PAYMENT_DETAILS_NEEDED",
              auction._id
            );
          } catch (emailErr) {
            console.error("Seller payment email failed:", emailErr.message);
          }
        }
      }
    }

    console.log(`🎉 Processed ${endedAuctions.length} ended auctions: notifications + emails`);

  } catch (err) {
    console.error("Status update error:", err);
  }
};




/* OPTIONAL: run every 1 minute */
setInterval(updateAuctionStatuses, 60000);

/* =======================
   MULTER CONFIG
======================= */
const uploadsPath = path.resolve(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📁 Upload path:", uploadsPath); // debug
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* =======================
   CREATE AUCTION
======================= */
router.post("/create", verifyToken, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create auctions"
      });
    }

    const schema = Joi.object({
      title: Joi.string().min(3).max(100).required(),
      description: Joi.string().max(500),
      startingPrice: Joi.number().min(0.01).required(),
      endTime: Joi.date().required(),
      category: Joi.string().max(50)
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { title, description, startingPrice, endTime, category } = req.body;

    const auction = new Auction({
      title,
      description,
      category,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      startingPrice: Number(startingPrice),
      currentPrice: Number(startingPrice),
      endTime: new Date(endTime),
      status: "pending",
      seller: req.user.id || req.user._id
    });

    await auction.save();

    res.status(201).json({
      success: true,
      data: auction
    });

  } catch (err) {
    console.error("CREATE AUCTION ERROR:", err);
    res.status(500).json({ success: false, message: err.message || "Server error" });
  }
});

/* =======================
   GET ACTIVE AUCTIONS
======================= */
router.get("/", async (req, res) => {
  try {
    await updateAuctionStatuses();

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
});

/* =======================
   PLACE BID
======================= */
router.post("/:id/bid", verifyToken, async (req, res) => {
  try {
    await updateAuctionStatuses();

    const userId = req.user.id || req.user._id;
    const { amount } = req.body;

    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }

    // ❗ prevent bidding on ended auction
    if (
      auction.status === "ended" ||
      new Date() > new Date(auction.endTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Auction already ended"
      });
    }

    if (auction.seller.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Seller cannot bid"
      });
    }

    const minBid = (auction.currentPrice || auction.startingPrice) + 5;

    if (amount < minBid) {
      return res.status(400).json({
        success: false,
        message: `Minimum bid is ETB ${minBid}`
      });
    }

    auction.currentPrice = amount;
    auction.highestBidder = userId;
    auction.bids.push({
      bidder: userId,
      amount,
      timestamp: new Date()
    });

    await auction.save();

    const updatedAuction = await Auction.findById(auction._id)
      .populate("seller", "name email")
      .populate("highestBidder", "name email")
      .populate("bids.bidder", "name email");

    // 📧 NEW: Email + Notification for seller on new high bid
    if (updatedAuction.seller && updatedAuction.seller.email) {
      try {
        const { sendBidNotification } = require('../utils/email');
        await sendBidNotification(
          updatedAuction.seller.email,
          updatedAuction.seller._id,
          auction.title,
          req.user.name || 'Bidder',
          amount,
          auction._id
        );
        console.log('📧 Bid notification sent to seller:', updatedAuction.seller.email);
      } catch (emailError) {
        console.error('❌ Bid email failed:', emailError.message);
      }
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("bidUpdate", updatedAuction);
      io.to(userId.toString()).emit("youAreNewWinner", {
        auctionId: auction._id,
        message: `You're highest bidder on "${auction.title}"`
      });
    }

    res.json({
      success: true,
      message: "Bid placed",
      data: updatedAuction
    });

  } catch (err) {
    console.error("Bid error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =======================
   SINGLE AUCTION
======================= */
router.get("/:id", async (req, res) => {
  try {
    await updateAuctionStatuses();

    const auction = await Auction.findById(req.params.id)
      .populate("seller", "name email")
      .populate("highestBidder", "name email")
      .populate("bids.bidder", "name email");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    res.json({
      success: true,
      data: auction
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =======================
   UPDATE AUCTION
======================= */
router.put("/:id", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    const userId = req.user.id || req.user._id;

    if (auction.seller.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (auction.bids.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot edit after bidding starts"
      });
    }

    Object.assign(auction, req.body);

    if (req.file) {
      auction.image = `/uploads/${req.file.filename}`;
    }

    await auction.save();

    res.json({
      success: true,
      data: auction
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

/* =======================
   DELETE AUCTION
======================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Not found"
      });
    }

    const userId = req.user.id || req.user._id;

    if (
      auction.seller.toString() !== userId.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized"
      });
    }

    await Auction.findByIdAndDelete(req.params.id);

    const io = req.app.get("io");
    if (io) io.emit("auctionDeleted", req.params.id);

    res.json({
      success: true,
      message: "Deleted"
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =======================
   SELLER: MY AUCTIONS
======================= */
router.get("/mine", verifyToken, async (req, res) => {
  try {
    await updateAuctionStatuses();

    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller only"
      });
    }

    const sellerId = new mongoose.Types.ObjectId(
      req.user._id || req.user.id
    );

    const auctions = await Auction.find({ seller: sellerId })
      .populate("highestBidder", "name email")
      .populate("bids.bidder", "name")
      .sort({ endTime: -1 });

    res.json({
      success: true,
      count: auctions.length,
      data: auctions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

