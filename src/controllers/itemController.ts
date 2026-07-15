import { Response } from "express";
import Item from "../models/Item";
import { AuthRequest } from "../middleware/auth";

export const getItems = async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = "1",
      limit = "12",
    } = req.query;

    let query: any = { available: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("owner", "name avatar");

    res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getItemById = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("owner", "name avatar email")
      .populate("reviews.user", "name avatar");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const itemData = {
      ...req.body,
      owner: req.user?._id,
    };

    const item = await Item.create(itemData);
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const updateItem = async (req: AuthRequest, res: Response) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user?._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this item" });
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const deleteItem = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (
      item.owner.toString() !== req.user?._id.toString() &&
      req.user?.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this item" });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const alreadyReviewed = item.reviews.find(
      (review) => review.user.toString() === req.user?._id.toString()
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this item" });
    }

    const review = {
      user: req.user?._id as any,
      name: req.user?.name || "Anonymous",
      rating: Number(rating),
      comment,
    };

    item.reviews.push(review);
    item.numReviews = item.reviews.length;
    item.rating =
      item.reviews.reduce((acc, r) => acc + r.rating, 0) / item.reviews.length;

    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getMyItems = async (req: AuthRequest, res: Response) => {
  try {
    const items = await Item.find({ owner: req.user?._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: items });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};
