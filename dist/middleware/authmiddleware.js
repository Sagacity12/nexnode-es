"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authMiddleware = void 0;
const helper_1 = require("../helpers/helper");
const logger_1 = require("../logger/logger");
const http_errors_1 = __importDefault(require("http-errors"));
const blacklisted_1 = require("../helpers/blacklisted");
/**
 * Authentication middlware to protect routes
 * Verifies JWT token and checks if user is blacklisted
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns - Express middleware function
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const tokenHeader = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
            return next(http_errors_1.default.Unauthorized("Unauthorized: No token provided"));
        }
        const token = tokenHeader.split(' ')[1];
        if (!token) {
            return next(http_errors_1.default.Unauthorized("Unauthorized: No token provided"));
        }
        const data = (0, helper_1.jwtVerify)(token);
        if (!data.id)
            throw new http_errors_1.default.Unauthorized("Unauthorized: Invalid token");
        const isBlacklisted = await (0, blacklisted_1.isTokenBlacklisted)(token);
        if (isBlacklisted) {
            return next(http_errors_1.default.Unauthorized("Unauthorized: Token is blacklisted"));
        }
        req.user = data;
        req.token = token;
        next();
    }
    catch (error) {
        logger_1.logger.error("Authentication middleware error:", error);
        return next(http_errors_1.default.Unauthorized("Unauthorized: Invalid token"));
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Role-based authorization middleware
 */
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return next(http_errors_1.default.Forbidden("Forbidden: You do not have permission to access this resource"));
        }
        logger_1.logger.info(`User with role ${userRole} is authorized to access this resource`);
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
exports.default = { authMiddleware: exports.authMiddleware, authorizeRoles: exports.authorizeRoles };
//# sourceMappingURL=authmiddleware.js.map