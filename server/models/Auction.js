const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    image: {
      type: String
    },

    category: {
      type: String,
      trim: true
    },

    startingPrice: {
      type: Number,
      required: true,
      min: 0
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0
    },

    endTime: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "ended", "sold"],
      default: "pending"
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    bids: [
      {
        bidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        amount: Number,
        timestamp: Date
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Auction", auctionSchema);