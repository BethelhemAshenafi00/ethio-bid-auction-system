const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["seller", "bidder", "admin"],
      default: "bidder",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },

    // ✅ NEW: Seller payment details for winners
    paymentDetails: {
      bankName: {
        type: String,
        trim: true
      },
      accountNumber: {
        type: String,
        trim: true
      },
      telebirrNumber: {
        type: String,
        trim: true
      },
      instructions: {
        type: String,
        trim: true
      }
    }
  },

  {
    timestamps: true, // ✅ adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);