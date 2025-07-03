"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructHttpErrorResponse = exports.isValidCoordinates = exports.isValidPriceRange = exports.sanitizeInput = exports.isStrongPassword = exports.isValidPhone = exports.canRequestOTP = exports.generateSecureToken = exports.verifyTimedOTP = exports.generateTimedOTP = exports.generateOTP = exports.verifySocketToken = exports.jwtVerify = exports.jwtSign = exports.comparePassword = exports.hashedPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const hashedPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
    return hashedPassword;
};
exports.hashedPassword = hashedPassword;
const comparePassword = async (password, hash) => {
    return await bcrypt_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
const jwtSign = async (obj) => {
    return jsonwebtoken_1.default.sign(obj, `${process.env.JWT_SECRET}`, { expiresIn: '1d' });
};
exports.jwtSign = jwtSign;
const jwtVerify = (token) => {
    return jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
};
exports.jwtVerify = jwtVerify;
const verifySocketToken = async (socket, next) => {
    var _a;
    try {
        const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
        if (!token)
            throw new http_errors_1.default.Forbidden("Forbidden: No token provided");
        const data = (0, exports.jwtVerify)(token);
        if (!data.id)
            throw new http_errors_1.default.Unauthorized("Unauthorized: Invalid token");
    }
    catch (error) {
        const err = error;
        next(err);
    }
};
exports.verifySocketToken = verifySocketToken;
const generateOTP = (length) => {
    const digits = '0123456789';
    const Length = digits.length;
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits.charAt(Math.floor(Math.random() * Length));
    }
    return otp;
};
exports.generateOTP = generateOTP;
const generateTimedOTP = (length = 6) => {
    const otp = (0, exports.generateOTP)(length);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return { otp, expiresAt };
};
exports.generateTimedOTP = generateTimedOTP;
const verifyTimedOTP = (inputOTP, storedOTP, expiresAt) => {
    if (new Date() > expiresAt) {
        return { isValid: false, message: 'OTP has expired. Please request a new one' };
    }
    if (inputOTP === storedOTP) {
        return { isValid: true, message: 'OTP verified successfully' };
    }
    else {
        return { isValid: false, message: 'Invalid OTP. Please try again' };
    }
};
exports.verifyTimedOTP = verifyTimedOTP;
const generateSecureToken = (length = 32) => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
};
exports.generateSecureToken = generateSecureToken;
const canRequestOTP = (lastRequestTime, cooldownMinutes = 5) => {
    const now = new Date();
    const timeDiff = now.getTime() - lastRequestTime.getTime();
    const cooldownMillis = cooldownMinutes * 60 * 1000;
    return timeDiff >= cooldownMillis;
};
exports.canRequestOTP = canRequestOTP;
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
const isStrongPassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (password.length < minLength) {
        return { isValid: false, message: `Password must be at least ${minLength} characters long.` };
    }
    if (!hasUpperCase) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!hasLowerCase) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!hasNumbers) {
        return { isValid: false, message: 'Password must contain at least one number.' };
    }
    if (!hasSpecialChars) {
        return { isValid: false, message: 'Password must contain at least one special character.' };
    }
    return { isValid: true, message: 'Password is strong.' };
};
exports.isStrongPassword = isStrongPassword;
const sanitizeInput = (input) => {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};
exports.sanitizeInput = sanitizeInput;
const isValidPriceRange = (price) => {
    const minPrice = 0;
    const maxPrice = 10000000;
    return price >= minPrice && price <= maxPrice;
};
exports.isValidPriceRange = isValidPriceRange;
const isValidCoordinates = (latitude, longitude) => {
    const minLatitude = -90;
    const maxLatitude = 90;
    const minLongitude = -180;
    const maxLongitude = 180;
    return (latitude >= minLatitude &&
        latitude <= maxLatitude &&
        longitude >= minLongitude &&
        longitude <= maxLongitude);
};
exports.isValidCoordinates = isValidCoordinates;
const constructHttpErrorResponse = (data = null, error = null, statusCode = 200) => {
    return (res) => {
        if (error) {
            return res.status(statusCode).json({
                error: {
                    message: error.message,
                    statusCode: error.statusCode || statusCode
                }
            });
        }
        return res.status(statusCode).json({
            data,
            statusCode
        });
    };
};
exports.constructHttpErrorResponse = constructHttpErrorResponse;
//# sourceMappingURL=helper.js.map