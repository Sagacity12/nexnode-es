"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resendOTPController = exports.changePasswordController = exports.resetPasswordController = exports.verifyPasswordResetController = exports.requestPasswordResetController = exports.unlinkGoogle = exports.linkGoogle = exports.googleLogin = exports.verifyLoginOTP = exports.generateLoginOTP = exports.login = exports.verifyEmail = exports.register = void 0;
const helper_1 = require("../helpers/helper");
const index_1 = require("../services/auth/index");
const googleAuth_1 = require("../services/auth/Oauth2/googleAuth");
const register = async (req, res) => {
    try {
        const result = await (0, index_1.registerUser)(req.body);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            userId: result.user._id,
            otpExpiry: result.otpExpiry,
        }, null, 201)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 500)(res);
    }
};
exports.register = register;
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await (0, index_1.verifyEmailOTP)(email, otp);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            user: {
                id: result.user._id,
                fullName: result.user.fullName,
                email: result.user.email,
                role: result.user.role,
                isEmailVerified: result.user.isEmailVerified,
            },
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.verifyEmail = verifyEmail;
const login = async (req, res) => {
    try {
        const result = await (0, index_1.authenticateCredentials)(req.body);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            userId: result.user._id,
            requires2FA: result.requires2FA,
            email: result.user.email,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 401)(res);
    }
};
exports.login = login;
const generateLoginOTP = async (req, res) => {
    try {
        const { userId, method = "email" } = req.body;
        const result = await (0, index_1.generateLogin2FA)(userId, method);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            otpSent: result.otpSent,
            method: result.method,
            expiresAt: result.expiresAt,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.generateLoginOTP = generateLoginOTP;
const verifyLoginOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const result = await (0, index_1.verifyLogin2FA)(userId, otp);
        const jwt = require("jsonwebtoken");
        const token = jwt.sign({
            id: result.user._id,
            email: result.user.email,
            role: result.user.role,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            token,
            user: {
                id: result.user._id,
                fullName: result.user.fullName,
                email: result.user.email,
                role: result.user.role,
                profilePicture: result.user.profilePicture,
            },
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.verifyLoginOTP = verifyLoginOTP;
const googleLogin = async (req, res) => {
    try {
        const result = await (0, googleAuth_1.googleAuth)(req.body);
        const jwt = require("jsonwebtoken");
        const token = jwt.sign({
            id: result.user._id,
            email: result.user.email,
            role: result.user.role,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: result.message,
            isNewUser: result.isNewUser,
            token,
            user: {
                id: result.user._id,
                fullName: result.user.fullName,
                email: result.user.email,
                role: result.user.role,
                profilePicture: result.user.profilePicture,
                authProvider: result.user.authProvider,
            },
        }, null, result.isNewUser ? 201 : 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.googleLogin = googleLogin;
const linkGoogle = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { googleToken } = req.body;
        const result = await (0, googleAuth_1.linkGoogleAccount)(userId, googleToken);
        (0, helper_1.constructHttpErrorResponse)({
            success: result.success,
            message: result.message,
            user: {
                id: result.user._id,
                fullName: result.user.fullName,
                email: result.user.email,
                authProvider: result.user.authProvider,
                profilePicture: result.user.profilePicture,
            },
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.linkGoogle = linkGoogle;
const unlinkGoogle = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { password } = req.body;
        const result = await (0, googleAuth_1.unlinkGoogleAccount)(userId, password);
        (0, helper_1.constructHttpErrorResponse)({
            success: result.success,
            message: result.message,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.unlinkGoogle = unlinkGoogle;
const requestPasswordResetController = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await (0, index_1.requestPasswordReset)(email);
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
exports.requestPasswordResetController = requestPasswordResetController;
const verifyPasswordResetController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await (0, index_1.verifyPasswordResetOTP)(email, otp);
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            isValid: result.isValid,
            message: result.message,
            userId: result.userId,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.verifyPasswordResetController = verifyPasswordResetController;
const resetPasswordController = async (req, res) => {
    try {
        const { userId, newPassword, confirmPassword } = req.body;
        const result = await (0, index_1.resetPassword)(userId, newPassword, confirmPassword);
        (0, helper_1.constructHttpErrorResponse)({
            success: result.success,
            message: result.message,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.resetPasswordController = resetPasswordController;
const changePasswordController = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const result = await (0, index_1.changePassword)(userId, currentPassword, newPassword, confirmPassword);
        (0, helper_1.constructHttpErrorResponse)({
            success: result.success,
            message: result.message,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 400)(res);
    }
};
exports.changePasswordController = changePasswordController;
const resendOTPController = async (req, res) => {
    try {
        const { email, purpose = "registration" } = req.body;
        const result = await (0, index_1.resendOTP)(email, purpose);
        (0, helper_1.constructHttpErrorResponse)({
            success: result.success,
            message: result.message,
            expiresAt: result.expiresAt,
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, error.status || 429)(res);
    }
};
exports.resendOTPController = resendOTPController;
const logout = async (req, res) => {
    try {
        (0, helper_1.constructHttpErrorResponse)({
            success: true,
            message: "Logged out successfully",
        }, null, 200)(res);
    }
    catch (error) {
        (0, helper_1.constructHttpErrorResponse)(null, error, 500)(res);
    }
};
exports.logout = logout;
//# sourceMappingURL=authcontroler.js.map