"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.getUserStats = exports.requestEmailVerificationController = exports.deleteAccount = exports.getAllUsersController = exports.updatePreferences = exports.updateProfilePictureController = exports.updateProfile = exports.getUserByIdController = exports.getProfile = void 0;
const helper_1 = require("../helpers/helper");
const index_1 = require("../services/user/index");
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const result = await (0, index_1.getUserProfile)(userId);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            user: result.user,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 404)(res);
    }
};
exports.getProfile = getProfile;
const getUserByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?.id;
        const currentUserRole = req.user?.role;
        if (currentUserRole !== "ADMIN" && currentUserId !== id) {
            (0, helper_1.constructHttpErrorResponse)(null, {
                message: "Access denied. You can only view your own profile.",
                statusCode: 403,
            }, 403)(res);
            return;
        }
        const user = await (0, index_1.getUserById)(id);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: "User retrieved successfully",
            user,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 404)(res);
    }
};
exports.getUserByIdController = getUserByIdController;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const result = await (0, index_1.updateUserProfile)(userId, req.body);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            user: result.user,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.updateProfile = updateProfile;
const updateProfilePictureController = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { profilePictureUrl } = req.body;
        const result = await (0, index_1.updateProfilePicture)(userId, profilePictureUrl);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            user: result.user,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.updateProfilePictureController = updateProfilePictureController;
const updatePreferences = async (req, res) => {
    try {
        const userId = req.user?.id;
        const result = await (0, index_1.updateUserPreferences)(userId, req.body);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            user: result.user,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.updatePreferences = updatePreferences;
const getAllUsersController = async (req, res) => {
    try {
        if (req.user?.role !== "ADMIN") {
            (0, helper_1.constructHttpErrorResponse)(null, {
                message: "Access denied. Admin only.",
                statusCode: 403,
            }, 403)(res);
            return;
        }
        const filters = req.query.filters
            ? JSON.parse(req.query.filters)
            : {};
        const options = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
        };
        const result = await (0, index_1.getAllUsers)(filters, options);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: "Users retrieved successfully",
            users: result.users,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 500)(res);
    }
};
exports.getAllUsersController = getAllUsersController;
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { password } = req.body;
        const result = await (0, index_1.deleteUserAccount)(userId, password);
        (0, helper_1.constructHttpErrorResponse)({
            success: result.success,
            message: result.message,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.deleteAccount = deleteAccount;
const requestEmailVerificationController = async (req, res) => {
    try {
        const userId = req.user?.id;
        const result = await (0, index_1.requestEmailVerification)(userId);
        (0, helper_1.constructHttpErrorResponse)({
            success: result.success,
            message: result.message,
            expiresAt: result.expiresAt,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.requestEmailVerificationController = requestEmailVerificationController;
const getUserStats = async (req, res) => {
    try {
        if (req.user?.role !== "ADMIN") {
            (0, helper_1.constructHttpErrorResponse)(null, {
                message: "Access denied. Admin only.",
                statusCode: 403,
            }, 403)(res);
            return;
        }
        const User = require("../models/userSchema").default;
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalClients = await User.countDocuments({
            role: "CLIENT",
            isActive: true,
        });
        const totalAdmins = await User.countDocuments({
            role: "ADMIN",
            isActive: true,
        });
        const verifiedUsers = await User.countDocuments({
            isEmailVerified: true,
            isActive: true,
        });
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            isActive: true,
        });
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: "User statistics retrieved successfully",
            stats: {
                totalUsers,
                totalClients,
                totalAdmins,
                verifiedUsers,
                recentUsers: recentUsers,
                verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
            },
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 500)(res);
    }
};
exports.getUserStats = getUserStats;
const searchUsers = async (req, res) => {
    try {
        if (req.user?.role !== "ADMIN") {
            (0, helper_1.constructHttpErrorResponse)(null, {
                message: "Access denied. Admin only.",
                statusCode: 403,
            }, 403)(res);
            return;
        }
        const { query, role, isVerified } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const User = require("../models/userSchema").default;
        const searchFilters = { isActive: true };
        if (query) {
            searchFilters.$or = [
                { fullName: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ];
        }
        if (role) {
            searchFilters.role = role;
        }
        if (isVerified !== undefined) {
            searchFilters.isEmailVerified = isVerified === "true";
        }
        const users = await User.find(searchFilters)
            .select("-password -tempOTP -tempOTPExpiry")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = await User.countDocuments(searchFilters);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: "Search results retrieved successfully",
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 500)(res);
    }
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=usercontroller.js.map