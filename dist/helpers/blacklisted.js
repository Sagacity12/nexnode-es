"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromBlacklist = exports.isTokenBlacklisted = exports.blacklistToken = void 0;
const redisConnectDB_1 = __importDefault(require("../servers/mongodb/redisConnectDB"));
/**
 * add a token to the blacklist
 * @param token - token to be blacklisted
 */
const blacklistToken = async (token) => {
    await redisConnectDB_1.default.setEx(`blacklisted:${token}`, 60 * 60 * 24, 'true');
};
exports.blacklistToken = blacklistToken;
/**
 * check if a token is blacklisted
 * @param token - token to check
 * @returns {Promise<boolean>} - true if the token is blacklisted, false otherwise
 */
const isTokenBlacklisted = async (token) => {
    const result = await redisConnectDB_1.default.get(`blacklisted:${token}`);
    return result === 'true';
};
exports.isTokenBlacklisted = isTokenBlacklisted;
/**
 * Remove a token from the blacklist
 * @param token - token to be removed from the blacklist
 */
const removeFromBlacklist = async (token) => {
    await redisConnectDB_1.default.del(`blacklisted:${token}`);
};
exports.removeFromBlacklist = removeFromBlacklist;
//# sourceMappingURL=blacklisted.js.map