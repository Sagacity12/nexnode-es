"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../../logger/logger");
// Connect to the database
const connectDB = async (url) => {
    mongoose_1.default.connection.on("connected", () => {
        logger_1.logger.info("MongoDB connected successfully");
    });
    mongoose_1.default.connection.on("error", (err) => {
        logger_1.logger.error("MongoDB connection error", err);
    });
    mongoose_1.default.connection.on("disconnected", (err) => {
        logger_1.logger.error("MongoDB disconnected", err);
    });
    try {
        await mongoose_1.default.connect(url, {});
        logger_1.logger.info("Database connection established");
        // Only run cleanup on first connection
        await runOneTimeCleanup();
        return true;
    }
    catch (error) {
        logger_1.logger.error("Failed to connect to MongoDB:", error);
        throw error;
    }
};
exports.connectDB = connectDB;
// Separate cleanup function
async function runOneTimeCleanup() {
    try {
        const db = mongoose_1.default.connection.db;
        if (!db)
            return;
        const collections = await db.listCollections({ name: "users" }).toArray();
        if (collections.length > 0) {
            console.log("🔧 Running one-time database cleanup...");
            const indexes = await db.collection("users").indexes();
            console.log("Current indexes:", indexes.map((idx) => idx.name));
            // Drop problematic username index
            try {
                await db.collection("users").dropIndex("username_1");
                console.log("✅ Dropped username_1 index");
            }
            catch (error) {
                console.log("ℹ️ username_1 index not found (this is good)");
            }
            // Clean up any username fields
            const result = await db
                .collection("users")
                .updateMany({ username: { $exists: true } }, { $unset: { username: 1 } });
            console.log(`✅ Cleaned ${result.modifiedCount} documents`);
            const deleteResult = await db
                .collection("users")
                .deleteMany({ username: null });
            console.log(`✅ Deleted ${deleteResult.deletedCount} documents with null username`);
            console.log("🎉 Database cleanup completed!");
        }
    }
    catch (error) {
        console.error("⚠️ Cleanup failed (non-critical):", error);
    }
}
//# sourceMappingURL=mongodb.js.map