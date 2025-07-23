"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usercontroller_1 = require("../controllers/usercontroller");
const authmiddleware_1 = require("../middleware/authmiddleware");
const router = (0, express_1.Router)();
const baseUrl = "/api/v1";
router.get(`${baseUrl}/profile`, authmiddleware_1.authMiddleware, usercontroller_1.getProfile);
router.get(`${baseUrl}/user/:id`, authmiddleware_1.authMiddleware, usercontroller_1.getUserByIdController);
router.put(`${baseUrl}/profile`, authmiddleware_1.authMiddleware, usercontroller_1.updateProfile);
router.put(`${baseUrl}/profile-picture`, authmiddleware_1.authMiddleware, usercontroller_1.updateProfilePictureController);
router.put(`${baseUrl}/preferences`, authmiddleware_1.authMiddleware, usercontroller_1.updatePreferences);
router.get(`${baseUrl}/users`, authmiddleware_1.authMiddleware, (0, authmiddleware_1.authorizeRoles)(["CLIENT"]), usercontroller_1.getAllUsersController);
router.delete(`${baseUrl}/account`, authmiddleware_1.authMiddleware, usercontroller_1.deleteAccount);
router.post(`${baseUrl}/request-email-verification`, authmiddleware_1.authMiddleware, usercontroller_1.requestEmailVerificationController);
router.get(`${baseUrl}/stats`, authmiddleware_1.authMiddleware, usercontroller_1.getUserStats);
router.get(`${baseUrl}/search-users`, authmiddleware_1.authMiddleware, usercontroller_1.searchUsers);
exports.default = router;
//# sourceMappingURL=user-route.js.map