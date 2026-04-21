const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { verifyToken } = require("../middleware/auth");

const Auction = require("../models/Auction");
const Payment = require("../models/Payment");
const User = require("../models/User");




router.get("/auctions", verifyToken, async (req, res) => {
  try {
    console.log("=== SELLER AUCTIONS DEBUG ===");
    console.log("User:", JSON.stringify(req.user, null, 2));
    console.log("Seller ID:", req.user._id);

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

    console.log(`✅ Found ${auctions.length} auctions for seller ${sellerId}`);
    console.log("AUCTIONS sample:", auctions.slice(0,2));
    
    res.json({
      success: true,
      data: auctions
    });

  } catch (err) {
    console.error("MY AUCTIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =======================
   SELLER: GET PAYMENTS
======================= */
router.get("/payments", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller access only"
      });
    }

    const sellerId = new mongoose.Types.ObjectId(req.user._id || req.user.id);


    const payments = await Payment.aggregate([
      {
        $lookup: {
          from: "auctions",
          localField: "auction",
          foreignField: "_id",
          as: "auctionDetails"
        }
      },
      { $unwind: "$auctionDetails" },

      // ✅ FIXED: use sellerId (NOT userId)
      {
        $match: {
          "auctionDetails.seller": sellerId
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "bidder",
          foreignField: "_id",
          as: "bidderDetails"
        }
      },
      {
        $unwind: {
          path: "$bidderDetails",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $project: {
          _id: 1,
          amount: 1,
          status: 1,
          method: 1,
          slip: 1,
          transactionId: 1,
          createdAt: 1,
          auction: {
            _id: "$auctionDetails._id",
            title: "$auctionDetails.title",
            image: "$auctionDetails.image",
            currentPrice: "$auctionDetails.currentPrice"
          },
          bidder: {
            _id: "$bidderDetails._id",
            name: "$bidderDetails.name",
            email: "$bidderDetails.email"
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });

  } catch (err) {
    console.error("SELLER PAYMENTS ERROR:", err); // ✅ DEBUG
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =======================
   SELLER: APPROVE PAYMENT
======================= */
router.patch("/payments/:id/approve", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller only"
      });
    }

    const userId = req.user._id || req.user.id;

    const payment = await Payment.findById(req.params.id).populate("auction");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    if (payment.status !== "proof_uploaded" && payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only approve pending/proof_uploaded payments"
      });
    }

    if (payment.auction.seller.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not your auction"
      });
    }

    payment.status = "paid";
    payment.paidAt = new Date();
    await payment.save();

    await Auction.findByIdAndUpdate(payment.auction._id, { status: "sold" });

    // 📧 NEW: Send notifications (payments.js already has, but for consistency)
    try {
      const { sendWinnerNotification, sendSellerPaymentNotification } = require('../utils/email');
      
      // Winner to bidder
      if (payment.bidder && payment.auction.highestBidder?.email) {
        await sendWinnerNotification(
          payment.auction.highestBidder.email,
          payment.bidder,
          payment.auction.title,
          payment.auction.seller.name,
          payment.amount || payment.auction.currentPrice,
          payment.auction._id
        );
      }

      // Seller confirmation
      const sellerId = req.user._id;
      await sendSellerPaymentNotification(
        req.user.email,
        sellerId,
        payment.auction.title,
        payment.auction.highestBidder?.name || 'Winner',
        payment.amount || payment.auction.currentPrice,
        payment.auction._id
      );

      console.log('📧 Seller approve notifications sent');
    } catch (emailErr) {
      console.error('❌ Seller approve email failed:', emailErr.message);
    }

    res.json({
      success: true,
      message: "Payment approved ✅"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


/* =======================
   SELLER: REQUEST PAYMENT FROM BIDDER
======================= */
router.post("/auction/:auctionId/request-payment", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller only"
      });
    }

    const sellerId = new mongoose.Types.ObjectId(req.user._id);
    const auctionId = new mongoose.Types.ObjectId(req.params.auctionId);

    const auction = await Auction.findById(auctionId).populate("highestBidder seller");

    if (!auction || !auction.highestBidder) {
      return res.status(404).json({
        success: false,
        message: "Auction or winner not found"
      });
    }

    if (auction.seller._id.toString() !== sellerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not your auction"
      });
    }

    if (auction.status !== "ended") {
      return res.status(400).json({
        success: false,
        message: "Auction must be ended"
      });
    }

    // Check if payment already exists
    let payment = await Payment.findOne({
      auction: auctionId,
      bidder: auction.highestBidder._id
    });

    if (payment) {
      return res.json({
        success: true,
        message: "Payment request already sent",
        data: payment
      });
    }

    // Create new pending payment with seller details
    payment = new Payment({
      auction: auctionId,
      bidder: auction.highestBidder._id,
      seller: sellerId,
      amount: auction.currentPrice,
      // ✅ Auto-use seller's preferred payment method if set
      method: auction.seller.paymentDetails?.telebirrNumber ? "telebirr" : "bank_transfer",

    });

    await payment.save();


    // Create notification for bidder with payment details
    const Notification = require("../models/Notification");
    const bidderNotif = new Notification({
      user: auction.highestBidder._id,
      type: "PAYMENT_REQUEST",
      auction: auctionId,
      title: `💳 Payment Request for "${auction.title}"`,
      message: `Seller requests ETB ${auction.currentPrice.toLocaleString()}. ${
        auction.seller.paymentDetails?.telebirrNumber 
          ? `Telebirr: ${auction.seller.paymentDetails.telebirrNumber}`
          : auction.seller.paymentDetails?.bankName 
            ? `${auction.seller.paymentDetails.bankName} - ${auction.seller.paymentDetails.accountNumber}`
            : "Payment details in profile"
      }. Upload slip after payment.`,
      data: {
        auctionId: auctionId.toString(),
        paymentId: payment._id.toString(),
        amount: auction.currentPrice,
        sellerPaymentDetails: auction.seller.paymentDetails
      },
      read: false
    });
    await bidderNotif.save();


    // Socket notification
    const io = req.app.get("io");
    if (io) {
      io.to(auction.highestBidder._id.toString()).emit("paymentRequired", {
        message: `Payment requested for "${auction.title}" - ETB ${auction.currentPrice.toLocaleString()}`,
        auctionId: auctionId.toString(),
        paymentId: payment._id.toString()
      });
    }

    res.json({
      success: true,
      message: "Payment request sent to bidder",
      data: payment
    });

  } catch (err) {
    console.error("REQUEST PAYMENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

/* =======================
   SELLER: DELETE PAYMENT
======================= */
router.delete("/payments/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller only"
      });
    }

    const userId = req.user._id || req.user.id;

    const payment = await Payment.findById(req.params.id).populate("auction");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // ✅ SAFE CHECK
    if (!payment.auction || payment.auction.seller.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized"
      });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Payment deleted"
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


/* =======================
   SELLER: UPDATE PAYMENT DETAILS
======================= */
router.put("/profile/payment-details", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller only"
      });
    }

    const userId = req.user._id || req.user.id;
    const { bankName, accountNumber, telebirrNumber, instructions } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        paymentDetails: {
          bankName: bankName?.trim() || null,
          accountNumber: accountNumber?.trim() || null,
          telebirrNumber: telebirrNumber?.trim() || null,
          instructions: instructions?.trim() || null
        }
      },
      { new: true, runValidators: true }
    ).select("paymentDetails");

    res.json({
      success: true,
      message: "Payment details updated ✅",
      data: updatedUser.paymentDetails
    });

  } catch (err) {
    console.error("PAYMENT DETAILS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
