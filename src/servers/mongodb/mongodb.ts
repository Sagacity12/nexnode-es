import mongoose from "mongoose";
import { logger } from "../../logger/logger";

// Connect to the database
export const connectDB = async (url: string) => {
  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error", err);
  });

  mongoose.connection.on("disconnected", (err) => {
    logger.error("MongoDB disconnected", err);
  });

  try {
    await mongoose.connect(url, {});
    logger.info("Database connection established");

    // Only run cleanup on first connection
    await runOneTimeCleanup();

    return true;
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

// Separate cleanup function
async function runOneTimeCleanup() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections({ name: "users" }).toArray();

    if (collections.length > 0) {
      console.log("🔧 Running one-time database cleanup...");

      const indexes = await db.collection("users").indexes();
      console.log(
        "Current indexes:",
        indexes.map((idx) => idx.name)
      );

      // Drop problematic username index
      try {
        await db.collection("users").dropIndex("username_1");
        console.log("✅ Dropped username_1 index");
      } catch (error) {
        console.log("ℹ️ username_1 index not found (this is good)");
      }

      // Clean up any username fields
      const result = await db
        .collection("users")
        .updateMany(
          { username: { $exists: true } },
          { $unset: { username: 1 } }
        );
      console.log(`✅ Cleaned ${result.modifiedCount} documents`);

      const deleteResult = await db
        .collection("users")
        .deleteMany({ username: null });
      console.log(
        `✅ Deleted ${deleteResult.deletedCount} documents with null username`
      );

      console.log("🎉 Database cleanup completed!");
    }
  } catch (error) {
    console.error("⚠️ Cleanup failed (non-critical):", error);
  }
}
