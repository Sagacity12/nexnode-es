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
const generateTwoFactorSecret = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateTwoFactorSecret = generateTwoFactorSecret;
const generateQRCodeImage = async (otpauthUrl) => {
    try {
        return await qrcode_1.default.toDataURL(otpauthUrl);
    }
    catch (error) {
        throw new Error(`Failed to generate QR code: ${error}`);
    }
};
exports.generateQRCodeImage = generateQRCodeImage;
const generateTwoFactorQRCode = (secret, label) => {
    return speakeasy_1.default.otpauthURL({
        secret: secret,
        label: label,
        issuer: 'Nexnode Real Estate',
        encoding: 'base32'
    });
};
exports.generateTwoFactorQRCode = generateTwoFactorQRCode;
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
const verifyTOTPToken = (token, secret) => {
    return speakeasy_1.default.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2,
    });
};
exports.verifyTOTPToken = verifyTOTPToken;
const generateBackupCodes = (count = 10) => {
    const backupCodes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        backupCodes.push(code);
    }
    return backupCodes;
};
exports.generateBackupCodes = generateBackupCodes;
const hashBackupCodes = async (codes) => {
    return Promise.all(codes.map(code => bcrypt_1.default.hash(code, 10)));
};
exports.hashBackupCodes = hashBackupCodes;
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