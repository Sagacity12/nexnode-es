import { config } from "dotenv";
config();

import { createExpressApp } from "./servers";
import applyRouters from "./routes/route";
import errorHandler from "./middleware/error-Handler";
import { connectDB } from "./servers/mongodb/mongodb";
import { Request, Response } from "express";
import express from "express";

const app = await createExpressApp();

// Database Initialization
const initDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MongoDB URL not provided");
    }
    await connectDB(mongoUrl);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Route Setup
const setupRoutes = async () => {
  try {
    // Define API Endpoints
    interface ApiEndpoints {
      api: string;
      auth: string;
      user: string;
    }

    interface ApiResponse {
      success: boolean;
      message: string;
      version: string;
      endpoints: ApiEndpoints;
    }

    // Root Route
    app.get("/", (req: Request, res: Response) => {
      res.json({
        success: true,
        message: "Welcome to Nexnode Real Estate API",
        version: "1.0.0",
        endpoints: {
          api: "/api/v1",
          auth: "/api/v1/auth",
          user: "/api/v1/user",
        },
      } as ApiResponse);
    });

    // Apply Routers
    await applyRouters(app);

    // Error Handler
    app.use(errorHandler);
  } catch (error) {
    console.error("Route setup error:", error);
  }
};

// Initialize App
const initApp = async () => {
  const app = await createExpressApp();
  try {
    await initDB();
    await setupRoutes();
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server listening on port", process.env.PORT || 3000);
    });
  } catch (error) {
    console.error("Error initializing app:", error);
    process.exit(1);
  }
};

initApp();

export default app;
