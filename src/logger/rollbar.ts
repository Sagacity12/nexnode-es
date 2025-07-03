import Rollbar from "rollbar";
import { config } from "dotenv";


config();

export const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    environment: process.env.NODE_ENV || "development",
    autoInstrument: true,
    enabled: Boolean(process.env.ROLLBAR_ACCESS_TOKEN),
    captureUncaught: true,
    captureUnhandledRejections: true,
});