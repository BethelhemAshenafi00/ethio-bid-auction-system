const mongoose = require("mongoose");
const Auction = require("./models/Auction");
const User = require("./models/User");
const bcrypt = require("bcrypt");

async function seedAuctions() {
  try {
    // Connect to same DB as app
    await mongoose.connect("mongodb://localhost:27017/auctionDB");
    console.log("✅ Connected to MongoDB");

    // Create sample seller if not exists
    let seller = await User.findOne({ email: "seller@test.com" });
    if (!seller) {
      const hashedPassword = await bcrypt.hash("seller123", 10);
      seller = new User({
        name: "Test Seller",
        email: "seller@test.com",
        phoneNumber: "0912345678",
        password: hashedPassword,
        role: "seller",
        isApproved: true
      });
      await seller.save();
      console.log("✅ Created sample seller:", seller.email);
    }

    // Delete existing sample auctions to avoid duplicates
    await Auction.deleteMany({ title: { $in: ["iPhone 15 Pro", "MacBook Air M3", "Samsung Galaxy S24", "Gaming PC RTX 4080"] } });
    console.log("🧹 Cleared existing samples");

    // Sample auctions (approved, future endTime ~2-7 days)
    const sampleAuctions = [
      {
        title: "iPhone 15 Pro 256GB",
        description: "Brand new iPhone 15 Pro in Natural Titanium. Unlocked.",
        category: "Electronics",
        image: null, // No image for simplicity
        startingPrice: 45000,
        currentPrice: 45000,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        status: "approved",
        seller: seller._id,
        highestBidder: null,
        bids: []
      },
      {
        title: "MacBook Air M3 16GB",
        description: "Latest MacBook Air with M3 chip, 16GB RAM, 512GB SSD. Space Gray.",
        category: "Electronics",
        image: null,
        startingPrice: 85000,
        currentPrice: 85000,
        endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
        status: "approved",
        seller: seller._id,
        highestBidder: null,
        bids: []
      },
      {
        title: "Samsung Galaxy S24 Ultra",
        description: "Samsung Galaxy S24 Ultra 12/256GB Titanium Black. Factory sealed.",
        category: "Electronics",
        image: null,
        startingPrice: 65000,
        currentPrice: 65000,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        status: "approved",
        seller: seller._id,
        highestBidder: null,
        bids: []
      },
      {
        title: "Gaming PC RTX 4080",
        description: "Custom gaming PC: i7-13700K, RTX 4080, 32GB DDR5, 1TB NVMe. RGB everything!",
        category: "Computers",
        image: null,
        startingPrice: 120000,
        currentPrice: 120000,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "approved",
        seller: seller._id,
        highestBidder: null,
        bids: []
      }
    ];

    // Create auctions
    const createdAuctions = [];
    for (const data of sampleAuctions) {
      const auction = new Auction(data);
      await auction.save();
      createdAuctions.push(auction);
      console.log(`✅ Created: "${auction.title}" (ID: ${auction._id})`);
    }

    console.log("\n🎉 SUCCESS! Seeded", createdAuctions.length, "approved auctions.");
    console.log("💡 Login as seller@test.com / seller123 to manage.");
    console.log("📱 Public page now shows auctions!");
    console.log("🔗 Run: cd server && node seedAuctions.js");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
}

seedAuctions();

