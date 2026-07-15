import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import itemRoutes from "./routes/items";
import errorHandler from "./middleware/errorHandler";
import Item from "./models/Item";

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

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
