import mongoose, { Document, Schema } from "mongoose";

export interface IReview {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IItem extends Document {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  category: string;
  location: string;
  address: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  guests: number;
  amenities: string[];
  rating: number;
  numReviews: number;
  reviews: IReview[];
  owner: mongoose.Types.ObjectId;
  featured: boolean;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const itemSchema = new Schema<IItem>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    fullDescription: {
      type: String,
      required: [true, "Full description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Apartment",
        "House",
        "Villa",
        "Cabin",
        "Loft",
        "Condo",
        "Townhouse",
        "Studio",
      ],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    images: [
      {
        type: String,
      },
    ],
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    amenities: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({ title: "text", location: "text", category: "text" });

export default mongoose.model<IItem>("Item", itemSchema);
