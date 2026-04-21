const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");

/* =======================
   MAILTRAP CONFIG (SAFE)
======================= */
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.MAILTRAP_PORT || 2525),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

/* =======================
   VERIFY CONNECTION
======================= */
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mailtrap connection failed:", error.message);
  } else {
    console.log("✅ Mailtrap is ready to send emails");
  }
});

/* =======================
   SAFE NOTIFICATION SAVER
======================= */
const saveNotification = async (data) => {
  try {
    if (data.userId) {
      await Notification.create({
        user: data.userId,
        type: data.eventType,
        auction: data.auctionId,
        message: data.message,
      });
    }
  } catch (err) {
    console.error("⚠️ Notification save failed:", err.message);
  }
};

/* =======================
   GENERIC EMAIL SENDER
======================= */
const sendEmail = async (
  to,
  subject,
  html,
  userId = null,
  eventType = null,
  auctionId = null
) => {
  console.log("📧 EMAIL TRIGGERED:", { to, subject, userId, eventType });

  try {
    const info = await transporter.sendMail({
      from: process.env.MAILTRAP_FROM || '"Auction System" <no-reply@auction.com>',
      to,
      subject,
      html,
    });

    console.log("✅ EMAIL SENT:", info.messageId);

    await saveNotification({
      userId,
      eventType,
      auctionId,
      message: `Email sent: ${subject}`,
    });

    return info;
  } catch (error) {
    console.error("❌ EMAIL FAILED:", error.message);

    await saveNotification({
      userId,
      eventType,
      auctionId,
      message: `Email failed: ${error.message}`,
    });

    throw error;
  }
};

/* =======================
   BID NOTIFICATION
======================= */
const sendBidNotification = (
  sellerEmail,
  sellerId,
  auctionTitle,
  bidderName,
  amount,
  auctionId
) => {
  return sendEmail(
    sellerEmail,
    `New High Bid on "${auctionTitle}" - ETB ${amount}`,
    `
      <h2>🔔 New Bid Alert</h2>
      <p><b>Auction:</b> ${auctionTitle}</p>
      <p><b>Bidder:</b> ${bidderName}</p>
      <p><b>Amount:</b> ETB ${amount}</p>
    `,
    sellerId,
    "BID_PLACED",
    auctionId
  );
};

/* =======================
   WINNER NOTIFICATION
======================= */
const sendWinnerNotification = (
  bidderEmail,
  bidderId,
  auctionTitle,
  sellerName,
  amount,
  auctionId
) => {
  return sendEmail(
    bidderEmail,
    `🎉 You won "${auctionTitle}"`,
    `
      <h2>🎉 Congratulations!</h2>
      <p>You won: <b>${auctionTitle}</b></p>
      <p>Final Price: ETB ${amount}</p>
      <p>Seller: ${sellerName}</p>
    `,
    bidderId,
    "AUCTION_WON",
    auctionId
  );
};

/* =======================
   PAYMENT NOTIFICATION
======================= */
const sendSellerPaymentNotification = (
  sellerEmail,
  sellerId,
  auctionTitle,
  bidderName,
  amount,
  auctionId
) => {
  return sendEmail(
    sellerEmail,
    `💰 Payment Received for "${auctionTitle}"`,
    `
      <h2>💰 Payment Approved</h2>
      <p>Auction: ${auctionTitle}</p>
      <p>Buyer: ${bidderName}</p>
      <p>Amount: ETB ${amount}</p>
    `,
    sellerId,
    "PAYMENT_APPROVED",
    auctionId
  );
};

/* =======================
   ACCOUNT APPROVAL EMAIL
======================= */
const sendApprovalEmail = (userEmail, isApproved, userId) => {
  const status = isApproved ? "APPROVED" : "DECLINED";

  return sendEmail(
    userEmail,
    `Account ${status}`,
    `
      <h2>Online Bidding System</h2>
      <p>Your account has been <b>${status}</b></p>
    `,
    userId,
    isApproved ? "ACCOUNT_APPROVED" : "ACCOUNT_DECLINED"
  );
};

/* =======================
   EXPORTS
======================= */
module.exports = {
  sendEmail,
  sendBidNotification,
  sendWinnerNotification,
  sendSellerPaymentNotification,
  sendApprovalEmail,
};