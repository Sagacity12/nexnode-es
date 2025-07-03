import { Router } from 'express';
import {
  getProfile,
  getUserByIdController,
  updateProfile,
  updateProfilePictureController,
  updatePreferences,
  getAllUsersController,
  deleteAccount,
  requestEmailVerificationController,
  getUserStats,
  searchUsers,
} from "../controllers/usercontroller";
import { authMiddleware, authorizeRoles } from "../middleware/authmiddleware";

const router = Router();

const baseUrl = "/api/v1";

router.get(`${baseUrl}/profile`, authMiddleware, getProfile);
router.get(`${baseUrl}/user/:id`, authMiddleware, getUserByIdController);
router.put(`${baseUrl}/profile`, authMiddleware, updateProfile);
router.put(`${baseUrl}/profile-picture`, authMiddleware, updateProfilePictureController);
router.put(`${baseUrl}/preferences`, authMiddleware, updatePreferences);
router.get(`${baseUrl}/users`, authMiddleware, authorizeRoles(["CLIENT"]), getAllUsersController);
router.delete(`${baseUrl}/account`, authMiddleware, deleteAccount);
router.post(`${baseUrl}/request-email-verification`, authMiddleware, requestEmailVerificationController);
router.get(`${baseUrl}/stats`, authMiddleware, getUserStats);
router.get(`${baseUrl}/search-users`, authMiddleware, searchUsers);

export default router;