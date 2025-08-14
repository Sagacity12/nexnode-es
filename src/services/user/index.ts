
import { Types, FilterQuery, QueryOptions } from "mongoose";
import User from "../../models/userSchema";
import createError from "http-errors";
import * as helpers from "../../helpers/helper";
import { validateProfileData } from "./validate";
import { sendEmailOTP } from "../../helpers/email/email";
import { checkUserExists } from "../auth/index";
import { googleUserData, IUserDocument, IUserProfileUpdate } from "src/common/interfaces/user";



/**
 * Get user by ID
 * @param userId - User ID
 * @returns Promise with user data
 */
export const getUserById = async (userId: string): Promise<IUserDocument> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }
    return user;
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to get user: ${error.message}`);
  }
};

/**
 * Find user by email 
 * @param email - User email 
 * @returns Promise with user or null 
 */
export const findUserByEmail = async (email: string): Promise<IUserDocument | null> => {
    try {
         return await User.findOne({
            email: email.toLowerCase(),
            isActive: true
         });
    } catch (error: any) {
        throw createError(500, `Failed to find user: ${error.message}`);
    }
};


/**
 * Get user profile by ID (without sensitive fields)
 * @param userId - User ID
 * @returns Promise with user profile data
 */
export const getUserProfile = async (
  userId: string
): Promise<{
  user: IUserDocument;
  message: string;
}> => {
  try {
    const user = await User.findById(userId).select(
      "-password -tempOTP -tempOTPExpiry"
    );
    if (!user) {
      throw createError(404, "User profile not found");
    }

    return {
      user,
      message: "Profile retrieved successfully",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to get user profile: ${error.message}`);
  }
};

/**
 * Create Google User 
 * @param User - creating user using goolge 
 */
export const createGoogleUser = async (
  data: googleUserData
): Promise<IUserDocument> => {
  const user = await User.create({
    ...data,
    isActive: true,
  });

  return user;
};

/**
 * Update user profile
 * @param userId - User ID
 * @param updateData - Profile update data
 * @returns Promise with updated user profile
 */
export const updateUserProfile = async (
  userId: string,
  updateData: IUserProfileUpdate
): Promise<{
  user: IUserDocument;
  message: string;
}> => {
  try {
    await validateProfileData(updateData);

    const currentUser = await User.findById(userId).select("+password").exec();
    if (!currentUser) {
      throw createError(404, "User not found");
    }

    // Check if email is being changed and if it already exists
    if (updateData.email && updateData.email !== currentUser.email) {
      const emailExists = await checkUserExists(updateData.email);
      if (emailExists) {
        throw createError(409, "Email already exists");
      }
    }

    // Check if phone is being changed and if it already exists
    if (updateData.phone && updateData.phone !== currentUser.phone) {
      const phoneExists = await checkUserExists(
        currentUser.email,
        updateData.phone
      );
      if (phoneExists) {
        throw createError(409, "Phone number already exists");
      }
    }

    
    const updateObject: any = {};

    if (updateData.fullName) updateObject.Name = updateData.fullName;
    if (updateData.email) updateObject.email = updateData.email.toLowerCase();
    if (updateData.phone) updateObject.phone = updateData.phone;
    if (updateData.profilePicture)
      updateObject.profilePicture = updateData.profilePicture;
    if (updateData.Bio) updateObject.bio = updateData.Bio;

    
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
         emailNotifications:
           updateData.preferences.emailNotifications ??
           currentUser.preferences?.emailNotifications,
         smsNotifications:
           updateData.preferences.smsNotifications ??
           currentUser.preferences?.smsNotifications,
         propertyAlerts:
           updateData.preferences.propertyAlerts ??
           currentUser.preferences?.propertyAlerts,
       };
    }

   
    if (updateData.email && updateData.email !== currentUser.email) {
       updateObject.isEmailVerified = false;
      updateObject.emailVerificationRequired = true;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateObject, {
      new: true,
      runValidators: true,
    }).select("-password -tempOTP -tempOTPExpiry");

    if (!updatedUser) {
      throw createError(500, "Failed to update profile");
    }

    return {
      user: updatedUser,
      message: "Profile updated successfully",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to update profile: ${error.message}`);
  }
  }


/**
 * Update user profile picture
 * @param userId - User ID
 * @param profilePictureUrl - Profile picture URL
 * @returns Promise with updated user
 */
export const updateProfilePicture = async (
  userId: string,
  profilePictureUrl: string
): Promise<{
  user: IUserDocument;
  message: string;
}> => {
  try {
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(profilePictureUrl)) {
      throw createError(400, "Invalid profile picture URL format");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePictureUrl },
      { new: true }
    ).select("-password -tempOTP -tempOTPExpiry");

    if (!updatedUser) {
      throw createError(404, "User not found");
    }

    return {
      user: updatedUser,
      message: "Profile picture updated successfully",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(
      500,
  
    `Failed to update profile picture: ${error.message}`
    );
  }
};
/**
 * Update user preferences
 * @param userId - User ID
 * @param preferences - User preferences
 * @returns Promise with updated user
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    propertyAlerts?: boolean;
  }
): Promise<{
  user: IUserDocument;
  message: string;
}> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    const updatedPreferences = {
      emailNotifications:
        preferences.emailNotifications ??
        user.preferences?.emailNotifications ??
        true,
      smsNotifications:
        preferences.smsNotifications ??
        user.preferences?.smsNotifications ??
        false,
      propertyAlerts:
        preferences.propertyAlerts ?? user.preferences?.propertyAlerts ?? true,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences: updatedPreferences },
      { new: true }
    ).select("-password -tempOTP -tempOTPExpiry");

    if (!updatedUser) {
      throw createError(500, "Failed to update preferences");
    }

    return {
      user: updatedUser,
      message: "Preferences updated successfully",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to update preferences: ${error.message}`);
  }
};

/**
 * Get all users with filtering (Admin only)
 * @param filters - Query filters
 * @param options - Query options
 * @returns Promise with users list
 */
export const getAllUsers = async (
  filters: FilterQuery<IUserDocument> = {},
  options: QueryOptions = {}
): Promise<{
  users: IUserDocument[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const users = await User.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filters);

    return {
      users,
      total,
      page,
      limit,
    };
  } catch (error: any) {
    throw createError(500, `Failed to get users: ${error.message}`);
  }
};

/**
 * Soft delete user account
 * @param userId - User ID
 * @param password - User password for confirmation
 * @returns Promise with deletion result
 */
export const deleteUserAccount = async (
  userId: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw createError(404, "User not found");
    }

    const isPasswordValid = await helpers.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw createError(401, "Invalid password");
    }

    await User.findByIdAndUpdate(userId, {
      isActive: false,
      isEmailVerified: false,
      deletedAt: new Date(),
      email: `deleted_${Date.now()}_${user.email}`,
    });

    return {
      success: true,
      message: "Account deleted successfully",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to delete account: ${error.message}`);
  }
};

/**
 * Request email verification for updated email
 * @param userId - User ID
 * @returns Promise with verification request result
 */
export const requestEmailVerification = async (
  userId: string
): Promise<{
  success: boolean;
  message: string;
  expiresAt?: Date;
}> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    if (user.isEmailVerified) {
      return {
        success: true,
        message: "Email is already verified",
      };
    }

    const otpResult: { success: boolean; otp?: string; expiresAt?: Date; message: string } = await sendEmailOTP(user.email, "verification");

    if (!otpResult.success) {
      throw createError(500, "Failed to send verification email");
    }

    await User.findByIdAndUpdate(userId, {
      tempOTP: otpResult.otp,
      tempOTPExpiry: otpResult.expiresAt,
    });

    return {
      success: true,
      message: "Verification email sent successfully",
      expiresAt: otpResult.expiresAt,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(
      500,
      `Failed to request email verification: ${error.message}`
    );
  }
};

