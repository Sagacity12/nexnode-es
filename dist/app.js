"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const http_1 = __importDefault(require("http"));
const index_1 = require("./servers/index");
const logger_1 = require("./logger/logger");
const mongodb_1 = require("./servers/mongodb/mongodb");
const cors_1 = __importDefault(require("cors"));
const redisConnectDB_1 = __importDefault(require("./servers/mongodb/redisConnectDB"));
const route_1 = __importDefault(require("./routes/route"));
const error_Handler_1 = __importDefault(require("./middleware/error-Handler"));
const PORT = process.env.PORT || 4000;
/**
 * create he http server here and start the server
 */
const startServer = async () => {
    await (0, mongodb_1.connectDB)(String(process.env.MONGODB_URI));
    //logger.info("MongoDB connected successfully");
    await redisConnectDB_1.default.connect();
    logger_1.logger.info("Redis connected successfully");
    const app = await (0, index_1.createExpressApp)();
    app.get("/", (req, res) => {
        res.json({
            success: true,
            message: "Welcome to Nexnode Real Estate API",
            version: "1.0.0",
            endpoints: {
                api: "/api/v1",
                auth: "/api/v1/auth",
                user: "/api/v1/user",
            },
            server: {
                port: PORT,
                environment: process.env.NODE_ENV || "development",
            },
        });
    });
    await (0, route_1.default)(app);
    app.use(error_Handler_1.default);
    app.use((0, cors_1.default)({
        //origin: ["http://localhost:3000", ""],
        credentials: true,
    }));
    //app.all("*", (_req, _, next) => {
    //  next(createError(404, "Not Found"));
    //});
    const server = http_1.default.createServer(app);
    const io = (0, index_1.createSocketServer)(server);
    server.listen(PORT, () => {
        logger_1.logger.info(`Server started on port ${PORT}`);
    });
};
exports.startServer = startServer;
exports.default = exports.startServer;
//# sourceMappingURL=app.js.map