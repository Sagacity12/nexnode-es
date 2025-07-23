"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExpressApp = void 0;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const helmet_1 = __importDefault(require("helmet"));
const logger = {
    error: (...args) => console.error(...args),
};
const HelmetOptions = {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
};
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers 
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const createExpressApp = async () => {
    const app = (0, express_1.default)();
    const mongoStore = (0, connect_mongodb_session_1.default)(express_session_1.default);
    const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!mongoUrl) {
        throw new Error('MONGO_URL is not defined');
    }
    const store = new mongoStore({
        uri: mongoUrl,
        collection: 'sessions',
    });
    store.on('error', (err) => {
        logger.error('Session store error:', err);
    });
    app.set('trust proxy', 1); // Trust first proxy
    app.use(express_1.default.json({ limit: "50mb" })); // Limit JSON body size to 50mb
    app.use(limiter);
    app.use((0, helmet_1.default)(HelmetOptions)); // Use Helmet for security headers
    app.use(helmet_1.default.hidePoweredBy()); // Remove X-Powered-By header
    app.use(express_1.default.urlencoded({ extended: true }));
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
        throw new Error('SESSION_SECRET is not defined');
    }
    app.use((0, express_session_1.default)({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: store,
    }));
    app.get('/', (req, res) => {
        res.send('Nexnode API is working!');
    });
    return app;
};
exports.createExpressApp = createExpressApp;
//# sourceMappingURL=createExpressApp.js.map