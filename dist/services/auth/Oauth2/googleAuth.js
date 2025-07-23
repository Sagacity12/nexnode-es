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
exports.setPasswordForGoogleUser = exports.unlinkGoogleAccount = exports.linkGoogleAccount = exports.googleAuth = void 0;
const userSchema_1 = __importDefault(require("../../../models/userSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
const email_1 = require("../../../helpers/email/email");
const helpers = __importStar(require("../../../helpers/helper"));
const google_auth_library_1 = require("google-auth-library");
// Initialize Google OAuth client
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/**
 * Verify Google ID Token
 * @param token - Google ID token
 * @returns Promise with Google user data
 */
const verifyGoogleToken = async (token) => {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error("Invalid Google token payload");
        }
        return {
            email: payload.email || "",
            fullname: payload.name || "",
            picture: payload.picture || "",
            emailVerified: payload.email_verified || false,
        };
    }
    catch (error) {
        throw (0, http_errors_1.default)(401, `Invalid Google token: ${error.message}`);
    }
};
/**
 * Google OAuth login/registration
 * @param data - Google authentication data
 * @returns Promise with user data and authentication result
 */
const googleAuth = async (data) => {
    try {
        // Verify Google token
        const googleUser = await verifyGoogleToken(data.googleToken);
        if (!googleUser.email) {
            throw (0, http_errors_1.default)(400, "Google account must have a verified email");
        }
        // Check if user already exists
        let user = await userSchema_1.default.findOne({
            email: googleUser.email.toLowerCase(),
            isActive: true,
        });
        let isNewUser = false;
        if (!user) {
            // Create new user from Google data
            isNewUser = true;
            // Set default role from data or default to CLIENT
            const userRole = data.role || "CLIENT";
            if (!["CLIENT", "ADMIN"].includes(userRole)) {
                throw (0, http_errors_1.default)(400, "Role must be either CLIENT or ADMIN");
            }
            const newUser = new userSchema_1.default({
                fullName: googleUser.fullname,
                email: googleUser.email.toLowerCase(),
                phone: data.phone || null, // Optional phone from frontend
                role: userRole,
                profilePicture: googleUser.picture,
                isEmailVerified: googleUser.emailVerified,
                isActive: true,
                authProvider: "google",
                googleId: data.googleId || googleUser.email, // Store Google ID if provided
                createdAt: new Date(),
                lastLoginAt: new Date(),
            });
            user = await newUser.save();
            // Send welcome email for new Google users
            await (0, email_1.sendWelcomeEmail)(user.email, user.fullName);
        }
        else {
            // Update existing user's last login and Google info if needed
            await userSchema_1.default.findByIdAndUpdate(user._id, {
                lastLoginAt: new Date(),
                ...(user.profilePicture ? {} : { profilePicture: googleUser.picture }), // Update picture if not set
                ...(user.authProvider !== "google" ? { authProvider: "google" } : {}), // Update auth provider
            });
            user = await userSchema_1.default.findById(user._id);
        }
        if (!user) {
            throw (0, http_errors_1.default)(500, "Failed to process Google authentication");
        }
        return {
            user,
            isNewUser,
            loginSuccess: true,
            message: isNewUser
                ? `Welcome to Nexnode! Your account has been created successfully as ${user.role}.`
                : `Welcome back, ${user.fullName}! You're logged in successfully.`,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Google authentication failed: ${error.message}`);
    }
};
exports.googleAuth = googleAuth;
/**
 * Link Google account to existing user
 * @param userId - Existing user ID
 * @param googleToken - Google ID token
 * @returns Promise with linking result
 */
const linkGoogleAccount = async (userId, googleToken) => {
    try {
        // Verify Google token
        const googleUser = await verifyGoogleToken(googleToken);
        // Find the current user
        const user = await userSchema_1.default.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        // Check if Google email matches user email
        if (googleUser.email.toLowerCase() !== user.email.toLowerCase()) {
            throw (0, http_errors_1.default)(400, "Google email must match your account email");
        }
        // Check if Google account is already linked to another user
        const existingGoogleUser = await userSchema_1.default.findOne({
            googleId: googleUser.email,
            _id: { $ne: userId }, // Exclude current user
        });
        if (existingGoogleUser) {
            throw (0, http_errors_1.default)(409, "This Google account is already linked to another user");
        }
        // Link Google account
        const updatedUser = await userSchema_1.default.findByIdAndUpdate(userId, {
            googleId: googleUser.email,
            authProvider: "both", // Can use both email/password and Google
            ...(user.profilePicture ? {} : { profilePicture: googleUser.picture }),
        }, { new: true }).select("-password -tempOTP -tempOTPExpiry");
        if (!updatedUser) {
            throw (0, http_errors_1.default)(500, "Failed to link Google account");
        }
        return {
            success: true,
            message: "Google account linked successfully",
            user: updatedUser,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to link Google account: ${error.message}`);
    }
};
exports.linkGoogleAccount = linkGoogleAccount;
/**
 * Unlink Google account from user
 * @param userId - User ID
 * @param password - User password for confirmation
 * @returns Promise with unlinking result
 */
const unlinkGoogleAccount = async (userId, password) => {
    try {
        const user = await userSchema_1.default.findById(userId).select("+password");
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        // Verify password (only if user has a password set)
        if (user.password) {
            const isPasswordValid = await helpers.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw (0, http_errors_1.default)(401, "Invalid password");
            }
        }
        else {
            throw (0, http_errors_1.default)(400, "You must set a password before unlinking Google account");
        }
        // Check if Google is linked
        if (!user.googleId) {
            throw (0, http_errors_1.default)(400, "No Google account linked to this user");
        }
        // Unlink Google account
        await userSchema_1.default.findByIdAndUpdate(userId, {
            $unset: { googleId: 1 },
            authProvider: "email", // Set back to email/password only
        });
        return {
            success: true,
            message: "Google account unlinked successfully",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to unlink Google account: ${error.message}`);
    }
};
exports.unlinkGoogleAccount = unlinkGoogleAccount;
/**
 * Set password for Google-only users
 * @param userId - User ID
 * @param newPassword - New password
 * @param confirmPassword - Password confirmation
 * @returns Promise with result
 */
const setPasswordForGoogleUser = async (userId, newPassword, confirmPassword) => {
    try {
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            throw (0, http_errors_1.default)(400, "Passwords do not match");
        }
        // Validate password strength
        const passwordCheck = helpers.isStrongPassword(newPassword);
        if (!passwordCheck.isValid) {
            throw (0, http_errors_1.default)(400, passwordCheck.message);
        }
        const user = await userSchema_1.default.findById(userId).select("+password");
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        // Check if user already has a password
        if (user.password) {
            throw (0, http_errors_1.default)(400, "User already has a password set. Use change password instead.");
        }
        // Check if user is Google authenticated
        if (!user.googleId) {
            throw (0, http_errors_1.default)(400, "This feature is only for Google authenticated users");
        }
        // Hash and set password
        const hashedPassword = await helpers.hashedPassword(newPassword);
        await userSchema_1.default.findByIdAndUpdate(userId, {
            password: hashedPassword,
            authProvider: "both", // Now can use both methods
            lastPasswordChange: new Date(),
        });
        return {
            success: true,
            message: "Password set successfully. You can now login with email/password or Google.",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to set password: ${error.message}`);
    }
};
exports.setPasswordForGoogleUser = setPasswordForGoogleUser;
//# sourceMappingURL=googleAuth.js.map