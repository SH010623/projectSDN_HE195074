const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const News = require("./models/news.model");
const Voucher = require("./models/voucher.model");

const sampleNews = [
  {
    title: "Avatar 3: Fire and Ash Unveils Spectacular First Look",
    summary: "James Cameron returns with the next epic chapter in the Avatar saga, exploring the violent Ash people of Pandora.",
    content: "Director James Cameron officially presented the first look at Avatar: Fire and Ash at D23. The film will introduce the Ash People, a more aggressive Na'vi tribe led by Varang. Expect groundbreaking underwater and aerial visuals hitting theaters worldwide.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
    category: "Movies",
    author: "Cinema Newsroom",
    views: 142,
    isActive: true,
  },
  {
    title: "Mega Weekend Discount: Up to 50% Off on Popcorn & Drinks",
    summary: "Enjoy great cinema snacks with special combo discounts every Friday, Saturday, and Sunday.",
    content: "From this Friday through Sunday, National Cinema Center offers a massive 50% discount on large popcorn combos with any purchase of two VIP tickets. Claim your voucher now through the online booking dashboard.",
    image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=800",
    category: "Promotions",
    author: "Marketing Dept",
    views: 320,
    isActive: true,
  },
  {
    title: "International Animation Film Week 2026 Announced",
    summary: "Over 20 award-winning animated features will be screened during the annual animation festival.",
    content: "National Cinema Center is proud to host the International Animation Film Week from November 10 to November 17. The festival lineup features acclaimed animated works from Japan, France, South Korea, and the United States.",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800",
    category: "Events",
    author: "Events Team",
    views: 89,
    isActive: true,
  },
];

const sampleVouchers = [
  {
    code: "WELCOME50",
    title: "50,000 VND Welcome Voucher",
    description: "Applicable on your first movie booking of 120,000 VND or more.",
    discountType: "fixed",
    discountValue: 50000,
    minOrderValue: 120000,
    maxDiscount: 50000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    usageLimit: 500,
    usedCount: 35,
    isActive: true,
  },
  {
    code: "STUDENT20",
    title: "20% Off for Students",
    description: "Special 20% discount on 2D tickets for high school and university students.",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 80000,
    maxDiscount: 40000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    usageLimit: 300,
    usedCount: 88,
    isActive: true,
  },
  {
    code: "VIPCINEMA",
    title: "100,000 VND Off IMAX & 4DX Experience",
    description: "Exclusive luxury discount on premium screen formats with min order of 250,000 VND.",
    discountType: "fixed",
    discountValue: 100000,
    minOrderValue: 250000,
    maxDiscount: 100000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    usageLimit: 150,
    usedCount: 14,
    isActive: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for News & Voucher seeding...");

    // Seed News if empty
    const newsCount = await News.countDocuments();
    if (newsCount === 0) {
      await News.insertMany(sampleNews);
      console.log(`Successfully seeded ${sampleNews.length} news articles.`);
    } else {
      console.log(`News collection already has ${newsCount} documents. Skipped.`);
    }

    // Seed Vouchers if empty
    const voucherCount = await Voucher.countDocuments();
    if (voucherCount === 0) {
      await Voucher.insertMany(sampleVouchers);
      console.log(`Successfully seeded ${sampleVouchers.length} vouchers.`);
    } else {
      console.log(`Voucher collection already has ${voucherCount} documents. Skipped.`);
    }

    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
