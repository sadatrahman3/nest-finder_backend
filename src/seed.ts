import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User";
import Item from "./models/Item";
import { seedUsers, seedItems } from "./seedData";

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("MongoDB connected for seeding");

    await Item.deleteMany({});
    await User.deleteMany({});

    const createdUsers = (await User.create(seedUsers as any)) as unknown as any[];
    const adminUser = createdUsers[0];

    const itemsWithOwner = seedItems.map((item) => ({
      ...item,
      owner: adminUser._id,
    }));

    await Item.insertMany(itemsWithOwner);

    console.log("Database seeded successfully");
    console.log(`Created ${createdUsers.length} users`);
    console.log(`${itemsWithOwner.length} items created`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
