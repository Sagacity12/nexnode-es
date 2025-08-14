"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOTP = exports.changePassword = exports.resetPassword = exports.verifyPasswordResetOTP = exports.requestPasswordReset = exports.verifyLogin2FA = exports.generateLogin2FA = exports.authenticateCredentials = exports.verifyEmailOTP = exports.registerUser = exports.checkUserExists = void 0;
const userSchema_1 = __importDefault(require("../../models/userSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
const helpers = __importStar(require("../../helpers/helper"));
const validate_1 = require("../user/validate");
const email_1 = require("../../helpers/email/email");
const SMSOTP_1 = require("../../helpers/email/SMSOTP");
/**
 * Check if user already exists by email or phone
 * @param email - User email
 * @param phone - User phone (optional)
 * @returns Promise<boolean>
 */
const checkUserExists = async (email, phone) => {
    try {
        const query = phone ? { $or: [{ email }, { phone }] } : { email };
        const existingUser = await userSchema_1.default.findOne(query);
        return !!existingUser;
    }
    catch (error) {
        throw (0, http_errors_1.default)(500, `Failed to check user existence: ${error.message}`);
    }
};
exports.checkUserExists = checkUserExists;
/**
 * Register new user (Step 1 of registration)
 * @param data - Registration data
 * @returns Promise with user data and OTP info
 */
const registerUser = async (data) => {
    try {
        // Validate input data
        await (0, validate_1.validateAuthData)(data);
        const passwordCheck = helpers.isStrongPassword(data.password);
        if (!passwordCheck.isValid) {
            throw (0, http_errors_1.default)(400, passwordCheck.message);
        }
        const userExists = await (0, exports.checkUserExists)(data.email, data.phone);
        if (userExists) {
            throw (0, http_errors_1.default)(409, "User with this email or phone already exists");
        }
        const userRole = data.role || "CLIENT";
        if (!["CLIENT", "ADMIN"].includes(userRole)) {
            throw (0, http_errors_1.default)(400, "Role must be either CLIENT or ADMIN");
        }
        const hashedPass = await helpers.hashedPassword(data.password);
        const newUser = new userSchema_1.default({
            fullName: data.fullName,
            email: data.email.toLowerCase(),
            phone: data.phone,
            password: hashedPass,
            role: userRole,
            isEmailVerified: false,
            isActive: true,
            authProvider: "local",
            createdAt: new Date(),
            lastLoginAt: null,
        });
        const savedUser = await newUser.save();
        const emailResult = await (0, email_1.sendEmailOTP)(data.email, "registration");
        if (!emailResult.success) {
            await userSchema_1.default.findByIdAndDelete(savedUser._id);
            throw (0, http_errors_1.default)(500, "Failed to send verification email. Please try again.");
        }
        await userSchema_1.default.findByIdAndUpdate(savedUser._id, {
            tempOTP: emailResult.otp,
            tempOTPExpiry: emailResult.expiresAt,
        });
        return {
            user: savedUser,
            emailOTP: emailResult.otp,
            otpExpiry: emailResult.expiresAt,
            message: `Registration successful! Please check your email for verification code. Role: ${userRole}`,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Registration failed: ${error.message}`);
    }
};
exports.registerUser = registerUser;
/**
 * Verify email OTP and activate user account (Step 2 of registration)
 * @param email - User email
 * @param inputOTP - OTP entered by user
 * @returns Promise with verified user
 */
const verifyEmailOTP = async (email, inputOTP) => {
    try {
        await (0, validate_1.validateOTPData)({ otp: inputOTP, email });
        const user = await userSchema_1.default.findOne({
            email: email.toLowerCase(),
            isActive: true,
        }).select("+tempOTP +tempOTPExpiry");
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found or already verified");
        }
        if (!user.tempOTP || !user.tempOTPExpiry) {
            throw (0, http_errors_1.default)(400, "No verification code found. Please request a new one.");
        }
        const verification = helpers.verifyTimedOTP(inputOTP, user.tempOTP, user.tempOTPExpiry);
        if (!verification.isValid) {
            throw (0, http_errors_1.default)(400, verification.message);
        }
        const updatedUser = await userSchema_1.default.findByIdAndUpdate(user._id, {
            isEmailVerified: true,
            isActive: true,
            $unset: { tempOTP: 1, tempOTPExpiry: 1 },
        }, { new: true });
        if (!updatedUser) {
            throw (0, http_errors_1.default)(404, "Failed to activate user account");
        }
        await (0, email_1.sendWelcomeEmail)(updatedUser.email, updatedUser.fullName);
        return {
            user: updatedUser,
            message: `Email verified successfully! Welcome to Nexnode Real Estate as ${updatedUser.role}.`,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Email verification failed: ${error.message}`);
    }
};
exports.verifyEmailOTP = verifyEmailOTP;
/**
 * Authenticate user credentials
 * @param loginData - Email and password
 * @returns Promise with user data and 2FA requirement
 */
const authenticateCredentials = async (loginData) => {
    try {
        await (0, validate_1.validateLoginData)(loginData);
        const anyUser = await userSchema_1.default.findOne({
            email: loginData.email.toLowerCase(),
        });
        console.log("User exists:", {
            found: !!anyUser,
            email: anyUser?.email,
            isActive: anyUser?.isActive,
            isEmailVerified: anyUser?.isEmailVerified,
        });
        const user = await userSchema_1.default.findOne({
            email: loginData.email.toLowerCase(),
            // isActive: true,
        }).select("+password");
        if (!user) {
            throw (0, http_errors_1.default)(401, "Invalid email or password");
        }
        // if (!user.isEmailVerified) {
        //   throw createError(401, "Please verify your email before logging in");
        // }
        const isPasswordValid = await helpers.comparePassword(loginData.password, user.password);
        if (!isPasswordValid) {
            throw (0, http_errors_1.default)(401, "Invalid email or password");
        }
        //const requires2FA = user.is2FAEnabled || false;
        return {
            user,
            requires2FA: true,
            message: "Credentials verified. Please complete 2FA verification.",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Authentication failed: ${error.message}`);
    }
};
exports.authenticateCredentials = authenticateCredentials;
/**
 * Generate and send 2FA OTP for login (Step 2 of login)
 * @param userId - User ID
 * @param method - Delivery method (email or sms)
 * @returns Promise with OTP info
 */
const generateLogin2FA = async (userId, method = "email") => {
    try {
        const user = await userSchema_1.default.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        let otpResult;
        if (method === "email") {
            otpResult = await (0, email_1.sendEmailOTP)(user.email, "login");
        }
        else if (method === "sms" && user.phone) {
            otpResult = await (0, SMSOTP_1.sendSMSOTP)(user.phone, "login");
        }
        else {
            throw (0, http_errors_1.default)(400, "SMS method requires phone number");
        }
        if (!otpResult.success) {
            throw (0, http_errors_1.default)(500, `Failed to send OTP via ${method}`);
        }
        await userSchema_1.default.findByIdAndUpdate(userId, {
            tempOTP: otpResult.otp,
            tempOTPExpiry: otpResult.expiresAt,
        });
        return {
            otpSent: true,
            expiresAt: otpResult.expiresAt,
            method,
            message: `OTP sent successfully via ${method}`,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to generate 2FA: ${error.message}`);
    }
};
exports.generateLogin2FA = generateLogin2FA;
/**
 * Verify 2FA OTP and complete login (Step 3 of login)
 * @param userId - User ID
 * @param inputOTP - OTP entered by user
 * @returns Promise with login result
 */
const verifyLogin2FA = async (userId, inputOTP) => {
    try {
        await (0, validate_1.validateOTPData)({ otp: inputOTP });
        const user = await userSchema_1.default.findById(userId).select("+tempOTP +tempOTPExpiry");
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        if (!user.tempOTP || !user.tempOTPExpiry) {
            throw (0, http_errors_1.default)(400, "No OTP found. Please request a new one.");
        }
        const verification = helpers.verifyTimedOTP(inputOTP, user.tempOTP, user.tempOTPExpiry);
        if (!verification.isValid) {
            throw (0, http_errors_1.default)(400, verification.message);
        }
        const updatedUser = await userSchema_1.default.findByIdAndUpdate(userId, {
            $unset: { tempOTP: 1, tempOTPExpiry: 1 },
            lastLoginAt: new Date(),
        }, { new: true });
        if (!updatedUser) {
            throw (0, http_errors_1.default)(500, "Failed to complete login");
        }
        return {
            user: updatedUser,
            loginSuccess: true,
            message: `Login successful! Welcome back, ${updatedUser.fullName}.`,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `2FA verification failed: ${error.message}`);
    }
};
exports.verifyLogin2FA = verifyLogin2FA;
/**
 * Request password reset (Step 1)
 * @param email - User email
 * @returns Promise with reset request result
 */
const requestPasswordReset = async (email) => {
    try {
        const user = await userSchema_1.default.findOne({
            email: email.toLowerCase(),
            isActive: true,
        });
        if (!user) {
            return {
                success: true,
                message: "If an account with this email exists, a password reset code has been sent.",
            };
        }
        if (user.tempOTPExpiry) {
            const timeDiff = new Date().getTime() - user.tempOTPExpiry.getTime();
            if (timeDiff < 5 * 60 * 1000) {
                throw (0, http_errors_1.default)(429, "Please wait before requesting another password reset code");
            }
        }
        const otpResult = await (0, email_1.sendEmailOTP)(email, "password-reset");
        if (!otpResult.success) {
            throw (0, http_errors_1.default)(500, "Failed to send password reset email");
        }
        await userSchema_1.default.findByIdAndUpdate(user._id, {
            tempOTP: otpResult.otp,
            tempOTPExpiry: otpResult.expiresAt,
            passwordResetRequested: true,
        });
        return {
            success: true,
            message: "Password reset code sent to your email",
            expiresAt: otpResult.expiresAt,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to request password reset: ${error.message}`);
    }
};
exports.requestPasswordReset = requestPasswordReset;
/**
 * Verify password reset OTP (Step 2)
 * @param email - User email
 * @param inputOTP - OTP entered by user
 * @returns Promise with verification result
 */
const verifyPasswordResetOTP = async (email, inputOTP) => {
    try {
        await (0, validate_1.validateOTPData)({ email, otp: inputOTP });
        const user = await userSchema_1.default.findOne({
            email: email.toLowerCase(),
            isActive: true,
            passwordResetRequested: true,
        }).select("+tempOTP +tempOTPExpiry");
        if (!user) {
            throw (0, http_errors_1.default)(404, "Invalid reset request or user not found");
        }
        if (!user.tempOTP || !user.tempOTPExpiry) {
            throw (0, http_errors_1.default)(400, "Reset code not found or expired. Please request a new one.");
        }
        const verification = helpers.verifyTimedOTP(inputOTP, user.tempOTP, user.tempOTPExpiry);
        if (!verification.isValid) {
            throw (0, http_errors_1.default)(400, verification.message);
        }
        await userSchema_1.default.findByIdAndUpdate(user._id, {
            otpVerified: true,
            $unset: { tempOTP: 1, tempOTPExpiry: 1 },
        });
        return {
            isValid: true,
            userId: user._id.toString(),
            message: "Reset code verified. You can now set a new password.",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to verify reset code: ${error.message}`);
    }
};
exports.verifyPasswordResetOTP = verifyPasswordResetOTP;
/**
 * Reset password with new password (Step 3)
 * @param userId - User ID
 * @param newPassword - New password
 * @param confirmPassword - Password confirmation
 * @returns Promise with reset result
 */
const resetPassword = async (userId, newPassword, confirmPassword) => {
    try {
        if (newPassword !== confirmPassword) {
            throw (0, http_errors_1.default)(400, "Passwords do not match");
        }
        const passwordCheck = helpers.isStrongPassword(newPassword);
        if (!passwordCheck.isValid) {
            throw (0, http_errors_1.default)(400, passwordCheck.message);
        }
        const user = await userSchema_1.default.findOne({
            _id: userId,
            isActive: true,
            passwordResetRequested: true,
            otpVerified: true,
        }).select("+password");
        if (!user) {
            throw (0, http_errors_1.default)(400, "Invalid reset session. Please start over.");
        }
        const isSamePassword = await helpers.comparePassword(newPassword, user.password);
        if (isSamePassword) {
            throw (0, http_errors_1.default)(400, "New password must be different from current password");
        }
        const hashedPassword = await helpers.hashedPassword(newPassword);
        await userSchema_1.default.findByIdAndUpdate(userId, {
            password: hashedPassword,
            $unset: {
                passwordResetRequested: 1,
                otpVerified: 1,
            },
            lastPasswordChange: new Date(),
        });
        await (0, email_1.sendPasswordResetConfirmationEmail)(user.email, user.fullName);
        return {
            success: true,
            message: "Password reset successfully. You can now log in with your new password.",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to reset password: ${error.message}`);
    }
};
exports.resetPassword = resetPassword;
/**
 * Change password for logged-in user
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @param confirmPassword - Password confirmation
 * @returns Promise with change result
 */
const changePassword = async (userId, currentPassword, newPassword, confirmPassword) => {
    try {
        if (newPassword !== confirmPassword) {
            throw (0, http_errors_1.default)(400, "New passwords do not match");
        }
        const passwordCheck = helpers.isStrongPassword(newPassword);
        if (!passwordCheck.isValid) {
            throw (0, http_errors_1.default)(400, passwordCheck.message);
        }
        const user = await userSchema_1.default.findById(userId).select("+password");
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        const isCurrentPasswordValid = await helpers.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw (0, http_errors_1.default)(401, "Current password is incorrect");
        }
        const isSamePassword = await helpers.comparePassword(newPassword, user.password);
        if (isSamePassword) {
            throw (0, http_errors_1.default)(400, "New password must be different from current password");
        }
        const hashedPassword = await helpers.hashedPassword(newPassword);
        await userSchema_1.default.findByIdAndUpdate(userId, {
            password: hashedPassword,
            lastPasswordChange: new Date(),
        });
        return {
            success: true,
            message: "Password changed successfully",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to change password: ${error.message}`);
    }
};
exports.changePassword = changePassword;
/**
 * Resend OTP with rate limiting
 * @param email - User email
 * @param purpose - OTP purpose
 * @returns Promise with resend result
 */
const resendOTP = async (email, purpose = "registration") => {
    try {
        const user = await userSchema_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        if (user.tempOTPExpiry) {
            const timeDiff = new Date().getTime() - user.tempOTPExpiry.getTime();
            if (timeDiff < 60000) {
                throw (0, http_errors_1.default)(429, "Please wait before requesting another OTP");
            }
        }
        const otpResult = await (0, email_1.sendEmailOTP)(email, purpose);
        if (!otpResult.success) {
            throw (0, http_errors_1.default)(500, "Failed to send OTP");
        }
        await userSchema_1.default.findByIdAndUpdate(user._id, {
            tempOTP: otpResult.otp,
            tempOTPExpiry: otpResult.expiresAt,
        });
        return {
            success: true,
            message: "New OTP sent successfully",
            expiresAt: otpResult.expiresAt,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to resend OTP: ${error.message}`);
    }
};
exports.resendOTP = resendOTP;
//# sourceMappingURL=index.js.map