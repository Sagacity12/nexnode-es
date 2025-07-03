import { config } from "dotenv";
import { logger, rollbar } from "./logger/index";

/**
 * Main entry point for the application.
 * Loads environment variables, initializes logging, and starts the server.
 */
const main = async () => {
  config();
  const start = await import("./app");
  await start.startServer();
  logger.info("Application started successfully");
};

main().catch((error) => {
  logger.error("Error starting application", error);
  rollbar.error(error);
  process.exit(1);
});
