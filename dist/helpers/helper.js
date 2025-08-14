"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructHttpErrorResponse = exports.isValidCoordinates = exports.isValidPriceRange = exports.sanitizeInput = exports.isStrongPassword = exports.isValidPhone = exports.canRequestOTP = exports.generateSecureToken = exports.verifyTimedOTP = exports.generateTimedOTP = exports.generateOTP = exports.verifySocketToken = exports.jwtVerify = exports.jwtSign = exports.comparePassword = exports.hashedPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
/**
 * * Hashes a password using bcrypt.
 * * @param password - The password to hash.
 * * @returns A promise that resolves to the hashed password.
 */
const hashedPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
    return hashedPassword;
};
exports.hashedPassword = hashedPassword;
/**
 * Compares a password with a hashed password.
 * @param password - The plain text password to compare.
 * @param hash - The hashed password to compare against.
 * @returns A promise that resolves to a boolean indicating whether the passwords match.
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
/**
 * JWT Signing function.
 * @param abject - The object to sign.
 * * @returns A promise that resolves to the signed JWT token.
 */
const jwtSign = async (obj) => {
    return jsonwebtoken_1.default.sign(obj, `${process.env.JWT_SECRET}`, { expiresIn: '1d' });
};
exports.jwtSign = jwtSign;
const jwtVerify = (token) => {
    return jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
};
exports.jwtVerify = jwtVerify;
/**
 * Socket.IO error handler middleware.
 * @param socket - The socket instance.
 * @param next - The next middleware function.
 * @returns A promise that resolves to void.
 */
const verifySocketToken = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
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
/**
 * generate a random otp of a given lenght for verification
 * @param length - The length of the OTP to generate.
 * @returns otp code : A promise that resolves to the generated OTP.
 */
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
/**
 * Generates timed OTP with expiration
 * @param length - The lenth of the OTP to generate.
 * @returns object with OTP and expiration time
 */
const generateTimedOTP = (length = 6) => {
    const otp = (0, exports.generateOTP)(length);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return { otp, expiresAt };
};
exports.generateTimedOTP = generateTimedOTP;
/**
 * Verify time OTP with expiration check
 * @param inputOTP - The OTP entered by user
 * @param storedOTP -  The OTP stored in database
 * @param expiresAt - When the OTP expires
 * @returns Verification result
 */
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
/**
 * Generate secure token for email verification
 * @param length - Token length in bytes
 * @returns Secure random token
 */
const generateSecureToken = (length = 32) => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
};
exports.generateSecureToken = generateSecureToken;
/**
 * Rate limiting helper for OTP requests
 * @param lastRequestTime - When OTP was last requested
 * @param cooldownMinutes - Cool period in minutes
 * @returns Whether new OTP can be requested
 */
const canRequestOTP = (lastRequestTime, cooldownMinutes = 5) => {
    const now = new Date();
    const timeDiff = now.getTime() - lastRequestTime.getTime();
    const cooldownMillis = cooldownMinutes * 60 * 1000;
    return timeDiff >= cooldownMillis;
};
exports.canRequestOTP = canRequestOTP;
/**
 * Phone number validation
 * @param phone - The phone number to validate.
 * @returns A boolean indicating whether the phone number is valid.
 */
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
/**
 * Password strength validation
 * @param password - The password to validate.
 * @returns A boolean indicating whether the password is strong enough.
 */
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
/**
 * Sanitize input to prevent XSS attacks.
 * @param input - The input string to sanitize.
 * @returns The sanitized input string.
 */
const sanitizeInput = (input) => {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};
exports.sanitizeInput = sanitizeInput;
/**
 * Validate property price range.
 * @param price - The price to validate.
 * @returns A boolean indicating whether the price is valid.
 */
const isValidPriceRange = (price) => {
    const minPrice = 0;
    const maxPrice = 10000000;
    return price >= minPrice && price <= maxPrice;
};
exports.isValidPriceRange = isValidPriceRange;
/**
 * Validate coordinates for latitude and longitude.
 * @param latitude - The latitude to validate.
 * @param longitude - The longitude to validate.
 * @returns A boolean indicating whether the coordinates are valid.
 */
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
/**
 * Construct Http Error
 * @param data
 * @param error
 * @param statusCode
 * @return
 */
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