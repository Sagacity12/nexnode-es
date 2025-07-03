import { Request, Response } from "express";
import { constructHttpErrorResponse } from "../helpers/helper";
import {
  getUserById,
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  updateUserPreferences,
  getAllUsers,
  deleteUserAccount,
  requestEmailVerification,
} from "../services/user/index";

/**
 * Get Current User Profile
 * 
 */
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id; 
    const result = await getUserProfile(userId);

    constructHttpErrorResponse(
      {
        success: true,
        message: result.message,
        user: result.user,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 404)(res);
  }
};

/**
 * Get User by ID 
 * 
 */
export const getUserByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;
    const currentUserRole = req.user?.role;

    // Check if user can access this profile
    if (currentUserRole !== "ADMIN" && currentUserId !== id) {
      constructHttpErrorResponse(
        null,
        {
          message: "Access denied. You can only view your own profile.",
          statusCode: 403,
        } as any,
        403
      )(res);
      return;
    }

    const user = await getUserById(id);

    constructHttpErrorResponse(
      {
        success: true,
        message: "User retrieved successfully",
        user,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 404)(res);
  }
};

/**
 * Update User Profile
 * 
 */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await updateUserProfile(userId, req.body);

    constructHttpErrorResponse(
      {
        success: true,
        message: result.message,
        user: result.user,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Update Profile Picture
 * 
 */
export const updateProfilePictureController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { profilePictureUrl } = req.body;

    const result = await updateProfilePicture(userId, profilePictureUrl);

    constructHttpErrorResponse(
      {
        success: true,
        message: result.message,
        user: result.user,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Update User Preferences
 * 
 */
export const updatePreferences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await updateUserPreferences(userId, req.body);

    constructHttpErrorResponse(
      {
        success: true,
        message: result.message,
        user: result.user,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Get All Users 
 * 
 */
export const getAllUsersController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    
    if (req.user?.role !== "ADMIN") {
      constructHttpErrorResponse(
        null,
        {
          message: "Access denied. Admin only.",
          statusCode: 403,
        } as any,
        403
      )(res);
      return;
    }

    const filters = req.query.filters
      ? JSON.parse(req.query.filters as string)
      : {};
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    };

    const result = await getAllUsers(filters, options);

    constructHttpErrorResponse(
      {
        success: true,
        message: "Users retrieved successfully",
        users: result.users,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 500)(res);
  }
};

/**
 * Delete User Account 
 * 
 */
export const deleteAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    const result = await deleteUserAccount(userId, password);

    constructHttpErrorResponse(
      {
        success: result.success,
        message: result.message,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Request Email Verification
 * 
 */
export const requestEmailVerificationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await requestEmailVerification(userId);

    constructHttpErrorResponse(
      {
        success: result.success,
        message: result.message,
        expiresAt: result.expiresAt,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Get User Statistics 
 * 
 */
export const getUserStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    
    if (req.user?.role !== "ADMIN") {
      constructHttpErrorResponse(
        null,
        {
          message: "Access denied. Admin only.",
          statusCode: 403,
        } as any,
        403
      )(res);
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

    constructHttpErrorResponse(
      {
        success: true,
        message: "User statistics retrieved successfully",
        stats: {
          totalUsers,
          totalClients,
          totalAdmins,
          verifiedUsers,
          recentUsers: recentUsers,
          verificationRate:
            totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
        },
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 500)(res);
  }
};

/**
 * Search Users 
 * 
 */
export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    
    if (req.user?.role !== "ADMIN") {
      constructHttpErrorResponse(
        null,
        {
          message: "Access denied. Admin only.",
          statusCode: 403,
        } as any,
        403
      )(res);
      return;
    }

    const { query, role, isVerified } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const User = require("../models/userSchema").default;

    const searchFilters: any = { isActive: true };

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

    constructHttpErrorResponse(
      {
        success: true,
        message: "Search results retrieved successfully",
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 500)(res);
  }
};
