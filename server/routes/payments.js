const express = require("express");
const Joi = require("joi");
const multer = require("multer");
const router = express.Router();

const Payment = require("../models/Payment");
const Auction = require("../models/Auction");
const { verifyToken } = require("../middleware/auth");

/* =======================
   MULTER FOR SLIP UPLOAD
======================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* =======================
   GET MY PAYMENTS
======================= */
router.get("/my", verifyToken, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userId = new mongoose.Types.ObjectId(req.user.id || req.user._id);

    const payments = await Payment.aggregate([
      // Match only this bidder
      {
        $match: { bidder: userId }
      },

      // Sort so latest comes last in group
      {
        $sort: { createdAt: 1 }
      },

      // Group by auction (get latest payment per auction)
      {
        $group: {
          _id: "$auction",
          latestPayment: { $last: "$$ROOT" },
          count: { $sum: 1 }
        }
      },

      // Lookup auction
      {
        $lookup: {
          from: "auctions",
          localField: "_id",
          foreignField: "_id",
          as: "auction"
        }
      },

      // Lookup bidder
      {
        $lookup: {
          from: "users",
          localField: "latestPayment.bidder",
          foreignField: "_id",
          as: "bidder"
        }
      },

      // Clean structure
      {
        $addFields: {
          "latestPayment.auction": { $arrayElemAt: ["$auction", 0] },
          "latestPayment.bidder": { $arrayElemAt: ["$bidder", 0] }
        }
      },

      // Replace root
      {
        $replaceRoot: { newRoot: "$latestPayment" }
      },

      // Final sort (latest first)
      {
        $sort: { createdAt: -1 }
      }
    ]);

    console.log("✅ Bidder payments found:", payments.length);

    res.json({
      success: true,
      data: payments
    });

  } catch (err) {
    console.error("Payments error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});
/* Seller: GET LATEST PENDING PAYMENTS PER AUCTION */
router.get("/seller", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Seller access only" });
    }

    const userId = req.user._id || req.user.id;

    const payments = await Payment.aggregate([
      // Match seller's auctions
      {
        $match: {
          "auction.seller": userId,
          status: { $in: ["pending", "initiated", "proof_uploaded"] }
        }
      },
      // Group by auction, get latest payment
      {
        $group: {
          _id: "$auction",
          latestPayment: { $last: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      // Lookup auction & bidder details
      {
        $lookup: {
          from: "auctions",
          localField: "_id",
          foreignField: "_id",
          as: "auction"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "latestPayment.bidder",
          foreignField: "_id", 
          as: "bidder"
        }
      },
      // Populate arrays
      {
        $addFields: {
          "latestPayment.auction": { $arrayElemAt: ["$auction", 0] },
          "latestPayment.bidder": { $arrayElemAt: ["$bidder", 0] }
        }
      },
      // Project final structure
      {
        $replaceRoot: { newRoot: "$latestPayment" }
      },
      // Sort by createdAt desc
      { $sort: { createdAt: -1 } }
    ]);

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* Seller/Admin: APPROVE PAYMENT */
router.patch("/seller/:id/approve", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    if (!["seller", "admin"].includes(role)) {
      return res.status(403).json({ success: false, message: "Seller/Admin only" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: 'auction',
      populate: { path: 'seller' }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Seller can only approve own auctions
    if (role === "seller" && !payment.auction.seller._id.equals(userId)) {
      return res.status(403).json({ success: false, message: "Can only approve your auctions" });
    }

    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    // Complete auction
    payment.auction.status = 'sold';
    await payment.auction.save();

    // 📧 NEW: Send winner & seller notifications
    try {
      const { sendWinnerNotification, sendSellerPaymentNotification } = require('../utils/email');
      
      // Winner notification to bidder
      if (payment.bidder && payment.auction.highestBidder?.email) {
        await sendWinnerNotification(
          payment.auction.highestBidder.email,
          payment.bidder,
          payment.auction.title,
          payment.auction.seller.name,
          payment.amount,
          payment.auction._id
        );
      }

      // Payment received to seller
      if (payment.auction.seller?.email) {
        await sendSellerPaymentNotification(
          payment.auction.seller.email,
          payment.auction.seller._id,
          payment.auction.title,
          payment.auction.highestBidder?.name || 'Bidder',
          payment.amount,
          payment.auction._id
        );
      }

      console.log('📧 Payment notifications sent for:', payment.auction.title);
    } catch (emailErr) {
      console.error('❌ Payment email failed:', emailErr.message);
    }

    res.json({ 
      success: true, 
      message: "Payment approved & auction sold", 
      data: payment 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Approve failed" });
  }
});

/* Seller/Admin: REJECT PAYMENT */
router.patch("/seller/:id/reject", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    if (!["seller", "admin"].includes(role)) {
      return res.status(403).json({ success: false, message: "Seller/Admin only" });
    }

    const payment = await Payment.findById(req.params.id).populate({
      path: 'auction',
      populate: { path: 'seller' }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Seller can only reject own auctions
    if (role === "seller" && !payment.auction.seller._id.equals(userId)) {
      return res.status(403).json({ success: false, message: "Can only reject your auctions" });
    }

    payment.status = 'rejected';
    await payment.save();

    // Optional: notify bidder via socket
    const io = req.app.get('io');
    if (io && payment.bidder) {
      io.to(payment.bidder.toString()).emit('paymentRejected', {
        paymentId: payment._id,
        message: `Payment for "${payment.auction.title}" rejected by seller. Please re-upload slip.`
      });
    }

    res.json({ 
      success: true, 
      message: "Payment rejected. Bidder can re-upload slip.", 
      data: payment 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Reject failed" });
  }
});

/* =======================
   SIMULATE PAYMENT
======================= */
router.post("/:auctionId/charge", verifyToken, async (req, res) => {
  try {
    const { amount, method } = req.body;
    const userId = req.user._id || req.user.id;
    
    // 🔍 DEBUG LOG
    console.log("🔍 PAYMENT CHARGE - userId:", userId, "auctionId:", req.params.auctionId);

    const schema = Joi.object({
      amount: Joi.number().min(0).required(),
      method: Joi.string().valid(
        "telebirr",
        "cbe",
        "dashen",
        "awash",
        "chapa"
      ).required()
    });

    const { error } = schema.validate({ amount, method });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const auction = await Auction.findById(req.params.auctionId).populate("highestBidder");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }

// ✅ FIXED: Legacy payment support + proper auth
    if (!auction.highestBidder) {
      // ⚠️ LEGACY PAYMENT: Allow existing payments without highestBidder
      console.log("⚠️ LEGACY PAYMENT - no highestBidder found, allowing access");
    } else if (!auction.highestBidder._id.equals(userId)) {
      console.log("❌ 403 BLOCKED - userId:", userId, "highestBidder:", auction.highestBidder?._id);
      return res.status(403).json({
        success: false,
        message: "Only highest bidder can pay"
      });
    } else {
      console.log("✅ AUTH PASSED - highest bidder verified");
    }

    if (new Date() < new Date(auction.endTime)) {
      return res.status(400).json({
        success: false,
        message: "Auction not ended yet"
      });
    }

    // ✅ MANUAL PAYMENT: Generate method-specific redirect
    const paymentRedirects = {
      telebirr: {
        redirectUrl: `telebirr://pay?amount=${amount}&ref=TLBRR${Date.now()}${Math.floor(Math.random()*10000)}`,
        message: `Open Telebirr app and scan QR or use deep link. Ref: TLBRR${Date.now()}`,
        refPrefix: "TLBRR"
      },
      chapa: {
        redirectUrl: `https://sandbox.chapa.co/checkout/pay/${'CHAPA'+Date.now()}`,
        message: "Redirecting to Chapa sandbox checkout",
        refPrefix: "CHAPA"
      },
      cbe: {
        redirectUrl: null,
        message: "Open CBE Birr app or portal. Use reference: CBE" + Date.now(),
        refPrefix: "CBE",
        instructions: "1. Open CBE Birr app\n2. Pay " + amount + " ETB\n3. Reference: CBE"+Date.now()+"\n4. Upload slip after"
      },
      dashen: {
        redirectUrl: null,
        message: "Dashen Online Banking. Reference: DASH" + Date.now(),
        refPrefix: "DASH",
        instructions: "Visit Dashen bank app/online. Use exact reference."
      },
      awash: {
        redirectUrl: null,
        message: "Awash Bank. Reference: AWASH" + Date.now(),
        refPrefix: "AWASH",
        instructions: "Awash internet banking/mobile app."
      }
    };

    const redirectData = paymentRedirects[method];
    if (!redirectData) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    const transactionId = `${redirectData.refPrefix}${Date.now()}${Math.floor(Math.random() * 10000)}`;

    const payment = new Payment({
      auction: auction._id,
      bidder: userId,
      amount,
      method,
      status: "initiated",
      redirectUrl: redirectData.redirectUrl,
      transactionId
    });

    await payment.save();

    res.json({
      success: true,
      data: payment,
      redirectUrl: redirectData.redirectUrl,
      message: redirectData.message,
      instructions: redirectData.instructions,
      ref: transactionId
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
   UPLOAD PAYMENT SLIP
======================= */
router.post("/:auctionId/slip", verifyToken, upload.single("slip"), async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // 🔍 DEBUG LOG
    console.log("🔍 PAYMENT SLIP - userId:", userId, "auctionId:", req.params.auctionId);

    const auction = await Auction.findById(req.params.auctionId).populate("highestBidder");

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found"
      });
    }

// ✅ FIXED: Legacy payment support + proper auth
    if (!auction.highestBidder) {
      // ⚠️ LEGACY PAYMENT: Allow existing payments without highestBidder
      console.log("⚠️ LEGACY PAYMENT - no highestBidder found, allowing slip upload");
    } else if (!auction.highestBidder._id.equals(userId)) {
      console.log("❌ 403 BLOCKED - userId:", userId, "highestBidder:", auction.highestBidder?._id);
      return res.status(403).json({
        success: false,
        message: "Only highest bidder can upload slip"
      });
    } else {
      console.log("✅ AUTH PASSED - slip upload authorized");
    }

    const slipPath = req.file ? `/uploads/${req.file.filename}` : null;

    let payment = await Payment.findOne({
      auction: req.params.auctionId,
      bidder: userId
    });

    if (!payment) {
      payment = new Payment({
        auction: req.params.auctionId,
        bidder: userId,
        seller: auction.seller,
        amount: auction.currentPrice,
        method: "manual",
        slip: slipPath,
        status: "proof_uploaded"
      });
    } else {
      payment.slip = slipPath;
      payment.seller = auction.seller;
      payment.status = "proof_uploaded";
      console.log(`📄 Slip added to payment for auction ${req.params.auctionId}`);
    }

    await payment.save();

    res.json({
      success: true,
      message: "Payment slip uploaded successfully! Waiting admin approval.",
      data: payment
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Upload failed"
    });
  }
});

/* DELETE PAYMENT */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    const payment = await Payment.findById(req.params.id).populate('auction bidder');
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Auth checks
    if (role !== "admin" && !payment.bidder._id.equals(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Payment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

/* REJECT PAYMENT (Admin) */
router.patch("/:id/reject", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate([
      { path: 'auction' },
      { path: 'bidder', select: 'name email' }
    ]);
    
    // Optional email to bidder
    if (payment.bidder?.email) {
      try {
        const { sendEmail } = require('../utils/email');
        await sendEmail(
          payment.bidder.email,
          `Payment Rejected for "${payment.auction.title}"`,
          `
            <div style="font-family: Arial; max-width: 600px;">
              <h2 style="color: #EF4444;">Payment Rejected</h2>
              <p>Your payment for <strong>${payment.auction.title}</strong> has been rejected.</p>
              <p>Please upload a new slip or contact support.</p>
            </div>
          `,
          payment.bidder._id,
          'PAYMENT_REJECTED',
          payment.auction._id
        );
      } catch (e) {
        console.error('Reject email failed:', e.message);
      }
    }
    
    res.json({ success: true, message: "Payment rejected", data: payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Reject failed" });
  }
});

module.exports = router;
