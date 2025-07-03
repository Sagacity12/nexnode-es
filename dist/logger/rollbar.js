"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollbar = void 0;
const rollbar_1 = __importDefault(require("rollbar"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.rollbar = new rollbar_1.default({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    environment: process.env.NODE_ENV || "development",
    autoInstrument: true,
    enabled: Boolean(process.env.ROLLBAR_ACCESS_TOKEN),
    captureUncaught: true,
    captureUnhandledRejections: true,
});
//# sourceMappingURL=rollbar.js.map