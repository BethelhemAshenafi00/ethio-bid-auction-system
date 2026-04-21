const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true
    },

    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ✅ ADD THIS (VERY IMPORTANT)
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    // ✅ CLEAN STATUS FLOW
    status: {
      type: String,
      enum: ["pending", "proof_uploaded", "slip_uploaded", "paid", "failed", "rejected"],
      default: "pending"
    },

    // ✅ ADD THIS (YOU USE IT IN FRONTEND)
    slip: {
      type: String // image path
    },

    method: {
      type: String,
      enum: ["telebirr", "cbe", "dashen", "awash", "bank_transfer", "chapa", "manual"],
      required: true
    },

    transactionId: String,
    redirectUrl: String,
    paidAt: Date,

    // ✅ NEW: Embedded seller payment info for bidder convenience
    sellerPaymentDetails: {
      bankName: String,
      accountNumber: String,
      telebirrNumber: String,
      instructions: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);