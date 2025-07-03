"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
const { combine, timestamp, printf, colorize, json } = winston_2.format;
exports.logger = winston_1.default.createLogger({
    level: 'info',
    format: combine(winston_1.default.format.errors({ stack: true }), colorize(), timestamp(), printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
    }), json()),
    transports: [
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
    ]
});
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({ format: winston_1.default.format.simple() }));
}
//# sourceMappingURL=logger.js.map