import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import itemRoutes from "./routes/items";
import adminRoutes from "./routes/admin";
import errorHandler from "./middleware/errorHandler";
import Item from "./models/Item";
import User from "./models/User";
import { seedUsers, seedItems } from "./seedData";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "https://nest-finder-frontend.vercel.app",
    "http://localhost:3000",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/stats", async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const totalLocations = await Item.distinct("location");
    const totalCategories = await Item.distinct("category");
    const avgPrice = await Item.aggregate([
      { $group: { _id: null, avgPrice: { $avg: "$price" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        totalLocations: totalLocations.length,
        totalCategories: totalCategories.length,
        avgPrice: avgPrice[0]?.avgPrice
          ? Math.round(avgPrice[0].avgPrice)
          : 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "NestFinder API is running" });
});

app.get("/api/admin/seed/:secret", async (req, res) => {
  if (req.params.secret !== "nestfinder-reseed-2024") {
    return res.status(403).json({ message: "Unauthorized" });
  }
  try {
    await Item.deleteMany({});
    await User.deleteMany({});
    const createdUsers = (await User.create(seedUsers as any)) as unknown as any[];
    const adminUser = createdUsers[0];
    const itemsWithOwner = seedItems.map((item) => ({
      ...item,
      owner: adminUser._id,
    }));
    await Item.insertMany(itemsWithOwner);
    res.json({
      success: true,
      message: `Seeded ${createdUsers.length} users and ${itemsWithOwner.length} items`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Seed failed" });
  }
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
