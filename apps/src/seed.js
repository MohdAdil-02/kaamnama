import mongoose from "mongoose";
import { connectDB, disconnectDB } from "./config/database.js";
import Category from "./models/Category.js";
import { DEFAULT_CATEGORIES } from "./constants/categories.js";

await connectDB();

for (const cat of DEFAULT_CATEGORIES) {
  await Category.updateOne({ slug: cat.slug }, { $setOnInsert: cat }, { upsert: true });
}

// Make sure all indexes exist (autoIndex is off in production)
await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));

console.log(`✅ Seeded ${DEFAULT_CATEGORIES.length} categories and synced indexes`);
await disconnectDB();
process.exit(0);