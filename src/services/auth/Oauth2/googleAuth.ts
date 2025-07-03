import { googleAuthInput} from "../../../common/interfaces/user/index"; 
import { IUserDocument } from "../../../common/interfaces/user/index";
import User from "../../../models/userSchema";
import  createError  from "http-errors";
import { sendWelcomeEmail } from "../../../helpers/email/email";
import * as helpers from "../../../helpers/helper";
import { OAuth2Client } from "google-auth-library";

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token
 * @param token - Google ID token
 * @returns Promise with Google user data
 */
const verifyGoogleToken = async (
  token: string
): Promise<{
  email: string;
  fullname: string;
  picture: string;
  emailVerified: boolean;
}> => {
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
  } catch (error: any) {
    throw createError(401, `Invalid Google token: ${error.message}`);
  }
};

/**
 * Google OAuth login/registration
 * @param data - Google authentication data
 * @returns Promise with user data and authentication result
 */
export const googleAuth = async (
  data: googleAuthInput
): Promise<{
  user: IUserDocument;
  isNewUser: boolean;
  loginSuccess: boolean;
  message: string;
}> => {
  try {
    // Verify Google token
    const googleUser = await verifyGoogleToken(data.googleToken);

    if (!googleUser.email) {
      throw createError(400, "Google account must have a verified email");
    }

    // Check if user already exists
    let user = await User.findOne({
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
        throw createError(400, "Role must be either CLIENT or ADMIN");
      }

      const newUser = new User({
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
      await sendWelcomeEmail(user.email, user.fullName);
    } else {
      // Update existing user's last login and Google info if needed
      await User.findByIdAndUpdate(user._id, {
        lastLoginAt: new Date(),
        ...(user.profilePicture ? {} : { profilePicture: googleUser.picture }), // Update picture if not set
        ...(user.authProvider !== "google" ? { authProvider: "google" } : {}), // Update auth provider
      });

      
      user = await User.findById(user._id);
    }

    if (!user) {
      throw createError(500, "Failed to process Google authentication");
    }

    return {
      user,
      isNewUser,
      loginSuccess: true,
      message: isNewUser
        ? `Welcome to Nexnode! Your account has been created successfully as ${user.role}.`
        : `Welcome back, ${user.fullName}! You're logged in successfully.`,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Google authentication failed: ${error.message}`);
  }
};

/**
 * Link Google account to existing user
 * @param userId - Existing user ID
 * @param googleToken - Google ID token
 * @returns Promise with linking result
 */
export const linkGoogleAccount = async (
  userId: string,
  googleToken: string
): Promise<{
  success: boolean;
  message: string;
  user: IUserDocument;
}> => {
  try {
    // Verify Google token
    const googleUser = await verifyGoogleToken(googleToken);

    // Find the current user
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    // Check if Google email matches user email
    if (googleUser.email.toLowerCase() !== user.email.toLowerCase()) {
      throw createError(400, "Google email must match your account email");
    }

    // Check if Google account is already linked to another user
    const existingGoogleUser = await User.findOne({
      googleId: googleUser.email,
      _id: { $ne: userId }, // Exclude current user
    });

    if (existingGoogleUser) {
      throw createError(
        409,
        "This Google account is already linked to another user"
      );
    }

    // Link Google account
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        googleId: googleUser.email,
        authProvider: "both", // Can use both email/password and Google
        ...(user.profilePicture ? {} : { profilePicture: googleUser.picture }),
      },
      { new: true }
    ).select("-password -tempOTP -tempOTPExpiry");

    if (!updatedUser) {
      throw createError(500, "Failed to link Google account");
    }

    return {
      success: true,
      message: "Google account linked successfully",
      user: updatedUser,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to link Google account: ${error.message}`);
  }
};

/**
 * Unlink Google account from user
 * @param userId - User ID
 * @param password - User password for confirmation
 * @returns Promise with unlinking result
 */
export const unlinkGoogleAccount = async (
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

    // Verify password (only if user has a password set)
    if (user.password) {
      const isPasswordValid = await helpers.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        throw createError(401, "Invalid password");
      }
    } else {
      throw createError(
        400,
        "You must set a password before unlinking Google account"
      );
    }

    // Check if Google is linked
    if (!user.googleId) {
      throw createError(400, "No Google account linked to this user");
    }

    // Unlink Google account
    await User.findByIdAndUpdate(userId, {
      $unset: { googleId: 1 },
      authProvider: "email", // Set back to email/password only
    });

    return {
      success: true,
      message: "Google account unlinked successfully",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to unlink Google account: ${error.message}`);
  }
};

/**
 * Set password for Google-only users
 * @param userId - User ID
 * @param newPassword - New password
 * @param confirmPassword - Password confirmation
 * @returns Promise with result
 */
export const setPasswordForGoogleUser = async (
  userId: string,
  newPassword: string,
  confirmPassword: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      throw createError(400, "Passwords do not match");
    }

    // Validate password strength
    const passwordCheck = helpers.isStrongPassword(newPassword);
    if (!passwordCheck.isValid) {
      throw createError(400, passwordCheck.message);
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw createError(404, "User not found");
    }

    // Check if user already has a password
    if (user.password) {
      throw createError(
        400,
        "User already has a password set. Use change password instead."
      );
    }

    // Check if user is Google authenticated
    if (!user.googleId) {
      throw createError(
        400,
        "This feature is only for Google authenticated users"
      );
    }

    // Hash and set password
    const hashedPassword = await helpers.hashedPassword(newPassword);
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      authProvider: "both", // Now can use both methods
      lastPasswordChange: new Date(),
    });

    return {
      success: true,
      message:
        "Password set successfully. You can now login with email/password or Google.",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to set password: ${error.message}`);
  }
};
