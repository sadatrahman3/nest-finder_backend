import { Response } from "express";
import User from "../models/User";
import Item from "../models/Item";
import { AuthRequest } from "../middleware/auth";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin user" });
    }

    await Item.deleteMany({ owner: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ success: true, message: "User and their items deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const reviewIndex = item.reviews.findIndex(
      (r: any) => r._id?.toString() === req.params.reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    item.reviews.splice(reviewIndex, 1);
    item.numReviews = item.reviews.length;
    item.rating =
      item.reviews.length > 0
        ? item.reviews.reduce((acc, r) => acc + r.rating, 0) / item.reviews.length
        : 0;

    await item.save();
    res.json({ success: true, message: "Review deleted", data: item });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const toggleFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.featured = !item.featured;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const toggleAvailable = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.available = !item.available;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getAllItemsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .populate("owner", "name email avatar");
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};
