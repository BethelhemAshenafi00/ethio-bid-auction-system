const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['BID_PLACED', 'AUCTION_WON', 'PAYMENT_APPROVED', 'PAYMENT_REJECTED', 'AUCTION_ENDED', 'PAYMENT_REQUEST', 'PAYMENT_DETAILS_NEEDED', 'AUCTION_APPROVED', 'AUCTION_REJECTED'],
    required: true
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
