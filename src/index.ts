const dotenv = require("dotenv");
dotenv.config();

import express from "express";
const { createExpressApp } = require("./servers");
const { connectDB } = require("./servers/mongodb/mongodb");
const applyRouters = require("./routes/route");
const errorHandler = require("./middleware/error-Handler");

// Create Express app
const app = createExpressApp();

// Database Initialization
const initDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MongoDB URL not provided");
    }
    await connectDB(mongoUrl);
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

// Route Setup
const setupRoutes = async () => {
  try {
    // Root Route
    interface ApiEndpoints {
      api: string;
      auth: string;
      user: string;
    }

    interface RootResponse {
      success: boolean;
      message: string;
      version: string;
      endpoints: ApiEndpoints;
    }

    app.get("/", (req: express.Request, res: express.Response): void => {
      res.json({
      success: true,
      message: "Welcome to Nexnode Real Estate API",
      version: "1.0.0",
      endpoints: {
        api: "/api/v1",
        auth: "/api/v1/auth",
        user: "/api/v1/user",
      },
      } as RootResponse);
    });

    // Apply Routers
    await applyRouters(app);

    // Error Handler
    app.use(errorHandler);
    console.log("✅ Routes initialized");
  } catch (error) {
    console.error("❌ Route setup error:", error);
  }
};

// Initialize everything
Promise.all([initDB(), setupRoutes()]).catch(console.error);

// Export for Vercel
module.exports = app;
