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
exports.requestEmailVerification = exports.deleteUserAccount = exports.getAllUsers = exports.updateUserPreferences = exports.updateProfilePicture = exports.updateUserProfile = exports.createGoogleUser = exports.getUserProfile = exports.findUserByEmail = exports.getUserById = void 0;
const userSchema_1 = __importDefault(require("../../models/userSchema"));
const http_errors_1 = __importDefault(require("http-errors"));
const helpers = __importStar(require("../../helpers/helper"));
const validate_1 = require("./validate");
const email_1 = require("../../helpers/email/email");
const index_1 = require("../auth/index");
/**
 * Get user by ID
 * @param userId - User ID
 * @returns Promise with user data
 */
const getUserById = async (userId) => {
    try {
        const user = await userSchema_1.default.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        return user;
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to get user: ${error.message}`);
    }
};
exports.getUserById = getUserById;
/**
 * Find user by email
 * @param email - User email
 * @returns Promise with user or null
 */
const findUserByEmail = async (email) => {
    try {
        return await userSchema_1.default.findOne({
            email: email.toLowerCase(),
            isActive: true
        });
    }
    catch (error) {
        throw (0, http_errors_1.default)(500, `Failed to find user: ${error.message}`);
    }
};
exports.findUserByEmail = findUserByEmail;
/**
 * Get user profile by ID (without sensitive fields)
 * @param userId - User ID
 * @returns Promise with user profile data
 */
const getUserProfile = async (userId) => {
    try {
        const user = await userSchema_1.default.findById(userId).select("-password -tempOTP -tempOTPExpiry");
        if (!user) {
            throw (0, http_errors_1.default)(404, "User profile not found");
        }
        return {
            user,
            message: "Profile retrieved successfully",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to get user profile: ${error.message}`);
    }
};
exports.getUserProfile = getUserProfile;
/**
 * Create Google User
 * @param User - creating user using goolge
 */
const createGoogleUser = async (data) => {
    const user = await userSchema_1.default.create({
        ...data,
        isActive: true,
    });
    return user;
};
exports.createGoogleUser = createGoogleUser;
/**
 * Update user profile
 * @param userId - User ID
 * @param updateData - Profile update data
 * @returns Promise with updated user profile
 */
const updateUserProfile = async (userId, updateData) => {
    try {
        await (0, validate_1.validateProfileData)(updateData);
        const currentUser = await userSchema_1.default.findById(userId).select("+password").exec();
        if (!currentUser) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        // Check if email is being changed and if it already exists
        if (updateData.email && updateData.email !== currentUser.email) {
            const emailExists = await (0, index_1.checkUserExists)(updateData.email);
            if (emailExists) {
                throw (0, http_errors_1.default)(409, "Email already exists");
            }
        }
        // Check if phone is being changed and if it already exists
        if (updateData.phone && updateData.phone !== currentUser.phone) {
            const phoneExists = await (0, index_1.checkUserExists)(currentUser.email, updateData.phone);
            if (phoneExists) {
                throw (0, http_errors_1.default)(409, "Phone number already exists");
            }
        }
        const updateObject = {};
        if (updateData.fullName)
            updateObject.Name = updateData.fullName;
        if (updateData.email)
            updateObject.email = updateData.email.toLowerCase();
        if (updateData.phone)
            updateObject.phone = updateData.phone;
        if (updateData.profilePicture)
            updateObject.profilePicture = updateData.profilePicture;
        if (updateData.Bio)
            updateObject.bio = updateData.Bio;
        if (updateData.Address) {
            updateObject.address = {
                street: updateData.Address?.street,
                city: updateData.Address?.city,
                state: updateData.Address?.state,
                zipCode: updateData.Address?.zipCode,
                country: updateData.Address?.country,
            };
        }
        if (updateData.preferences) {
            updateObject.preferences = {
                emailNotifications: updateData.preferences.emailNotifications ??
                    currentUser.preferences?.emailNotifications,
                smsNotifications: updateData.preferences.smsNotifications ??
                    currentUser.preferences?.smsNotifications,
                propertyAlerts: updateData.preferences.propertyAlerts ??
                    currentUser.preferences?.propertyAlerts,
            };
        }
        if (updateData.email && updateData.email !== currentUser.email) {
            updateObject.isEmailVerified = false;
            updateObject.emailVerificationRequired = true;
        }
        const updatedUser = await userSchema_1.default.findByIdAndUpdate(userId, updateObject, {
            new: true,
            runValidators: true,
        }).select("-password -tempOTP -tempOTPExpiry");
        if (!updatedUser) {
            throw (0, http_errors_1.default)(500, "Failed to update profile");
        }
        return {
            user: updatedUser,
            message: "Profile updated successfully",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to update profile: ${error.message}`);
    }
};
exports.updateUserProfile = updateUserProfile;
/**
 * Update user profile picture
 * @param userId - User ID
 * @param profilePictureUrl - Profile picture URL
 * @returns Promise with updated user
 */
const updateProfilePicture = async (userId, profilePictureUrl) => {
    try {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(profilePictureUrl)) {
            throw (0, http_errors_1.default)(400, "Invalid profile picture URL format");
        }
        const updatedUser = await userSchema_1.default.findByIdAndUpdate(userId, { profilePicture: profilePictureUrl }, { new: true }).select("-password -tempOTP -tempOTPExpiry");
        if (!updatedUser) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        return {
            user: updatedUser,
            message: "Profile picture updated successfully",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to update profile picture: ${error.message}`);
    }
};
exports.updateProfilePicture = updateProfilePicture;
/**
 * Update user preferences
 * @param userId - User ID
 * @param preferences - User preferences
 * @returns Promise with updated user
 */
const updateUserPreferences = async (userId, preferences) => {
    try {
        const user = await userSchema_1.default.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        const updatedPreferences = {
            emailNotifications: preferences.emailNotifications ??
                user.preferences?.emailNotifications ??
                true,
            smsNotifications: preferences.smsNotifications ??
                user.preferences?.smsNotifications ??
                false,
            propertyAlerts: preferences.propertyAlerts ?? user.preferences?.propertyAlerts ?? true,
        };
        const updatedUser = await userSchema_1.default.findByIdAndUpdate(userId, { preferences: updatedPreferences }, { new: true }).select("-password -tempOTP -tempOTPExpiry");
        if (!updatedUser) {
            throw (0, http_errors_1.default)(500, "Failed to update preferences");
        }
        return {
            user: updatedUser,
            message: "Preferences updated successfully",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to update preferences: ${error.message}`);
    }
};
exports.updateUserPreferences = updateUserPreferences;
/**
 * Get all users with filtering (Admin only)
 * @param filters - Query filters
 * @param options - Query options
 * @returns Promise with users list
 */
const getAllUsers = async (filters = {}, options = {}) => {
    try {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;
        const users = await userSchema_1.default.find(filters)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await userSchema_1.default.countDocuments(filters);
        return {
            users,
            total,
            page,
            limit,
        };
    }
    catch (error) {
        throw (0, http_errors_1.default)(500, `Failed to get users: ${error.message}`);
    }
};
exports.getAllUsers = getAllUsers;
/**
 * Soft delete user account
 * @param userId - User ID
 * @param password - User password for confirmation
 * @returns Promise with deletion result
 */
const deleteUserAccount = async (userId, password) => {
    try {
        const user = await userSchema_1.default.findById(userId).select("+password");
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        const isPasswordValid = await helpers.comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw (0, http_errors_1.default)(401, "Invalid password");
        }
        await userSchema_1.default.findByIdAndUpdate(userId, {
            isActive: false,
            isEmailVerified: false,
            deletedAt: new Date(),
            email: `deleted_${Date.now()}_${user.email}`,
        });
        return {
            success: true,
            message: "Account deleted successfully",
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to delete account: ${error.message}`);
    }
};
exports.deleteUserAccount = deleteUserAccount;
/**
 * Request email verification for updated email
 * @param userId - User ID
 * @returns Promise with verification request result
 */
const requestEmailVerification = async (userId) => {
    try {
        const user = await userSchema_1.default.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        if (user.isEmailVerified) {
            return {
                success: true,
                message: "Email is already verified",
            };
        }
        const otpResult = await (0, email_1.sendEmailOTP)(user.email, "verification");
        if (!otpResult.success) {
            throw (0, http_errors_1.default)(500, "Failed to send verification email");
        }
        await userSchema_1.default.findByIdAndUpdate(userId, {
            tempOTP: otpResult.otp,
            tempOTPExpiry: otpResult.expiresAt,
        });
        return {
            success: true,
            message: "Verification email sent successfully",
            expiresAt: otpResult.expiresAt,
        };
    }
    catch (error) {
        if (error.status)
            throw error;
        throw (0, http_errors_1.default)(500, `Failed to request email verification: ${error.message}`);
    }
};
exports.requestEmailVerification = requestEmailVerification;
//# sourceMappingURL=index.js.map