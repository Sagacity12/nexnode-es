"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBackupCode = exports.hashBackupCodes = exports.generateBackupCodes = exports.verifyTOTPToken = exports.generateTOTPSecret = exports.verifyTOTPOrSimpleOTP = exports.generateTOTPCode = exports.generateTwoFactorQRCode = exports.generateQRCodeImage = exports.generateTwoFactorSecret = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const qrcode_1 = __importDefault(require("qrcode"));
const speakeasy_1 = __importDefault(require("speakeasy"));
/**
 * Generates a secret key for two-factor authentication.
 * @returns {string} The generated secret key.
 */
const generateTwoFactorSecret = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateTwoFactorSecret = generateTwoFactorSecret;
/**
 * Generates a QR code image for TOTP setup
 */
const generateQRCodeImage = async (otpauthUrl) => {
    try {
        return await qrcode_1.default.toDataURL(otpauthUrl);
    }
    catch (error) {
        throw new Error(`Failed to generate QR code: ${error}`);
    }
};
exports.generateQRCodeImage = generateQRCodeImage;
/**
 * Generates a QR code URL for two-factor authentication.
 * @param secret - The secret key for two-factor authentication.
 * @param label - The label for the QR code, typically the user's email or username.
 * @returns {string} The generated QR code URL.
 */
const generateTwoFactorQRCode = (secret, label) => {
    return speakeasy_1.default.otpauthURL({
        secret: secret,
        label: label,
        issuer: 'Nexnode Real Estate',
        encoding: 'base32'
    });
};
exports.generateTwoFactorQRCode = generateTwoFactorQRCode;
/**
 * Generate time-based one-time password (TOTP) using the secret key.
 * @param secret - The secret key for two-factor authentication.
 * @returns {string} The generated OTP.
 */
const generateTOTPCode = (secret, length = 6) => {
    const otp = speakeasy_1.default.totp({
        secret: secret,
        encoding: 'base32',
        digits: length,
        step: 30
    });
    const validFor = 30;
    const expiresAt = Date.now() + validFor * 1000;
    return { otp, validFor, expiresAt };
};
exports.generateTOTPCode = generateTOTPCode;
/**
 * Verify TOTP  token (for authentication apps) - FIXED VERSION
 * @param inputOTP - The OTP input by the user.
 * @param secret - The secret key used to generate the OTP.
 * @param storedOTP - The OTP stored in the database or generated previously.
 * @param expiresAt - The expiration time of the OTP.
 * @return {Object} An object containing the validity status and a message.
 */
const verifyTOTPOrSimpleOTP = (inputOTP, secret, storedOTP, expiresAt) => {
    if (storedOTP && expiresAt) {
        if (new Date() > expiresAt) {
            return { isValid: false, message: 'OTP has expired' };
        }
        if (inputOTP === storedOTP) {
            return { isValid: true, message: 'Simple OTP verified successfully' };
        }
    }
    if (secret) {
        const isTOTPValid = speakeasy_1.default.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: inputOTP,
            window: 2,
            time: Math.floor(Date.now() / 1000)
        });
        if (isTOTPValid) {
            return { isValid: true, message: 'TOTP verified successfully' };
        }
    }
    return { isValid: false, message: 'Invalid OTP' };
};
exports.verifyTOTPOrSimpleOTP = verifyTOTPOrSimpleOTP;
// if (isValid) {
//    return { isValid: true, message: 'OTP verified successfully' };
//  } else {
//    return { isValid: false, message: 'Invalid OTP' };
// }
/**
 * Generates TOTP secret for authentication apps ( Google Authenticator, Authy, etc.)
 * @param userEmail - The user's email address.
 * @returns {string} The generated TOTP secret.
 */
const generateTOTPSecret = (userEmail) => {
    const secret = speakeasy_1.default.generateSecret({
        name: `Nexnode Real Estate (${userEmail})`,
        length: 32,
        issuer: 'Nexnode Real Estate',
    });
    return {
        secret: secret.base32 || '',
        qrCodeUrl: secret.otpauth_url || '',
        manualEntryKey: secret.base32 || '',
    };
};
exports.generateTOTPSecret = generateTOTPSecret;
/**
 * Verify TOTP token for from authentication apps
 * @param token - The TOTP token to verify.
 * @param secret - The TOTP secret used to generate the token.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
const verifyTOTPToken = (token, secret) => {
    return speakeasy_1.default.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2,
    });
};
exports.verifyTOTPToken = verifyTOTPToken;
/**
 * Generates backup codes for two-factor authentication.
 * @param count - The number of backup codes to generate.
 * @returns {string[]} An array of generated backup codes.
 */
const generateBackupCodes = (count = 10) => {
    const backupCodes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        backupCodes.push(code);
    }
    return backupCodes;
};
exports.generateBackupCodes = generateBackupCodes;
/**
 * Hash backup codes for secure storage.
 * @param codes - An array of backup codes to hash.
 * @returns {string[]} An array of hashed backup codes.
 */
const hashBackupCodes = async (codes) => {
    // const hashedCodes = await Promise.all(codes.map(code => bcrypt.hash(code, 10)));
    return Promise.all(codes.map(code => bcrypt_1.default.hash(code, 10)));
};
exports.hashBackupCodes = hashBackupCodes;
/**
 * Verifies a backup code against the stored hash.
 * @param code - The backup code to verify.
 * @param hash - The hashed backup code to compare against.
 * @returns {boolean} True if the backup code matches the hash, false otherwise.
 */
const verifyBackupCode = async (inputCode, hashedCodes) => {
    for (const hashedCode of hashedCodes) {
        if (await bcrypt_1.default.compare(inputCode, hashedCode)) {
            return true;
        }
    }
    return false;
};
exports.verifyBackupCode = verifyBackupCode;
//# sourceMappingURL=Two-factorAuth.js.map