import mongoose from "mongoose";
import env from "./environment.js";

mongoose.set("strictQuery", true);

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      autoIndex: !env.isProd, // build indexes manually in prod
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) =>
    console.error("MongoDB error:", err.message)
  );
  mongoose.connection.on("disconnected", () =>
    console.warn("⚠️ MongoDB disconnected")
  );
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
};