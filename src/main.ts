import { config } from "dotenv";
import { logger, rollbar } from "./logger/index";
import { startServer } from "./app"; 


export default startServer;


if (require.main === module) {
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
}
