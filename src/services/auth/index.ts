
import { Types } from "mongoose";
import User from "../../models/userSchema";
import createError from "http-errors";
import * as helpers from "../../helpers/helper";
import {
  validateAuthData,
  validateLoginData,
  validateOTPData,
} from "../user/validate";
import {
  sendEmailOTP,
  sendWelcomeEmail,
  sendPasswordResetConfirmationEmail,
} from "../../helpers/email/email";
import { sendSMSOTP } from "../../helpers/email/SMSOTP";
import { IUserDocument, IUserLogin, IUserRegistration } from "src/common/interfaces/user";

/**
 * Check if user already exists by email or phone
 * @param email - User email
 * @param phone - User phone (optional)
 * @returns Promise<boolean>
 */
export const checkUserExists = async (
  email: string,
  phone?: string
): Promise<boolean> => {
  try {
    const query = phone ? { $or: [{ email }, { phone }] } : { email };

    const existingUser = await User.findOne(query);
    return !!existingUser;
  } catch (error: any) {
    throw createError(500, `Failed to check user existence: ${error.message}`);
  }
};

/**
 * Register new user (Step 1 of registration)
 * @param data - Registration data
 * @returns Promise with user data and OTP info
 */
export const registerUser = async (
  data: IUserRegistration
): Promise<{
  user: IUserDocument;
  emailOTP: string;
  otpExpiry: Date;
  message: string;
}> => {
  try {
    // Validate input data
    await validateAuthData(data);

    
    const passwordCheck = helpers.isStrongPassword(data.password);
    if (!passwordCheck.isValid) {
      throw createError(400, passwordCheck.message);
    }

    
    const userExists = await checkUserExists(data.email, data.phone);
    if (userExists) {
      throw createError(409, "User with this email or phone already exists");
    }

   
    const userRole = data.role || "CLIENT";
    if (!["CLIENT", "ADMIN"].includes(userRole)) {
      throw createError(400, "Role must be either CLIENT or ADMIN");
    }

    
    const newUser = new User({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      password: data.password,
      role: userRole,
      isEmailVerified: false,
      isActive: false,
      authProvider: "local",
      createdAt: new Date(),
      lastLoginAt: null,
    });

    
    const savedUser = await newUser.save();

    
    const emailResult = await sendEmailOTP(data.email, "registration");

    if (!emailResult.success) {
      await User.findByIdAndDelete(savedUser._id);
      throw createError(
        500,
        "Failed to send verification email. Please try again."
      );
    }

    
    await User.findByIdAndUpdate(savedUser._id, {
      tempOTP: emailResult.otp,
      tempOTPExpiry: emailResult.expiresAt,
    });

    return {
      user: savedUser,
      emailOTP: emailResult.otp!,
      otpExpiry: emailResult.expiresAt!,
      message: `Registration successful! Please check your email for verification code. Role: ${userRole}`,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Registration failed: ${error.message}`);
  }
};

/**
 * Verify email OTP and activate user account (Step 2 of registration)
 * @param email - User email
 * @param inputOTP - OTP entered by user
 * @returns Promise with verified user
 */
export const verifyEmailOTP = async (
  email: string,
  inputOTP: string
): Promise<{
  user: IUserDocument;
  message: string;
}> => {
  try {
    await validateOTPData({ otp: inputOTP, email });

    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: false,
    }).select("+tempOTP +tempOTPExpiry");

    if (!user) {
      throw createError(404, "User not found or already verified");
    }

    if (!user.tempOTP || !user.tempOTPExpiry) {
      throw createError(
        400,
        "No verification code found. Please request a new one."
      );
    }

    const verification = helpers.verifyTimedOTP(
      inputOTP,
      user.tempOTP,
      user.tempOTPExpiry
    );

    if (!verification.isValid) {
      throw createError(400, verification.message);
    }

    
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        isEmailVerified: true,
        isActive: true,
        $unset: { tempOTP: 1, tempOTPExpiry: 1 },
      },
      { new: true }
    );

    if (!updatedUser) {
      throw createError(404, "Failed to activate user account");
    }

  
    await sendWelcomeEmail(updatedUser.email, updatedUser.fullName);

    return {
      user: updatedUser,
      message: `Email verified successfully! Welcome to Nexnode Real Estate as ${updatedUser.role}.`,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Email verification failed: ${error.message}`);
  }
};

/**
 * Authenticate user credentials 
 * @param loginData - Email and password
 * @returns Promise with user data and 2FA requirement
 */
export const authenticateCredentials = async (
  loginData: IUserLogin
): Promise<{
  user: IUserDocument;
  requires2FA: boolean;
  message: string;
}> => {
  try {
    await validateLoginData(loginData);

    const user = await User.findOne({
      email: loginData.email.toLowerCase(),
      isActive: true,
    }).select("+password");

    if (!user) {
      throw createError(401, "Invalid email or password");
    }

    if (!user.isEmailVerified) {
      throw createError(401, "Please verify your email before logging in");
    }

    const isPasswordValid = await helpers.comparePassword(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw createError(401, "Invalid email or password");
    }

    return {
      user,
      requires2FA: true,
      message: "Credentials verified. Please complete 2FA verification.",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Authentication failed: ${error.message}`);
  }
};

/**
 * Generate and send 2FA OTP for login (Step 2 of login)
 * @param userId - User ID
 * @param method - Delivery method (email or sms)
 * @returns Promise with OTP info
 */
export const generateLogin2FA = async (
  userId: string,
  method: "email" | "sms" = "email"
): Promise<{
  otpSent: boolean;
  expiresAt: Date;
  method: string;
  message: string;
}> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    let otpResult;

    if (method === "email") {
      otpResult = await sendEmailOTP(user.email, "login");
    } else if (method === "sms" && user.phone) {
      otpResult = await sendSMSOTP(user.phone, "login");
    } else {
      throw createError(400, "SMS method requires phone number");
    }

    if (!otpResult.success) {
      throw createError(500, `Failed to send OTP via ${method}`);
    }

    await User.findByIdAndUpdate(userId, {
      tempOTP: otpResult.otp,
      tempOTPExpiry: otpResult.expiresAt,
    });

    return {
      otpSent: true,
      expiresAt: otpResult.expiresAt!,
      method,
      message: `OTP sent successfully via ${method}`,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to generate 2FA: ${error.message}`);
  }
};

/**
 * Verify 2FA OTP and complete login (Step 3 of login)
 * @param userId - User ID
 * @param inputOTP - OTP entered by user
 * @returns Promise with login result
 */
export const verifyLogin2FA = async (
  userId: string,
  inputOTP: string
): Promise<{
  user: IUserDocument;
  loginSuccess: boolean;
  message: string;
}> => {
  try {
    await validateOTPData({ otp: inputOTP });

    const user = await User.findById(userId).select("+tempOTP +tempOTPExpiry");
    if (!user) {
      throw createError(404, "User not found");
    }

    if (!user.tempOTP || !user.tempOTPExpiry) {
      throw createError(400, "No OTP found. Please request a new one.");
    }

    const verification = helpers.verifyTimedOTP(
      inputOTP,
      user.tempOTP,
      user.tempOTPExpiry
    );

    if (!verification.isValid) {
      throw createError(400, verification.message);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $unset: { tempOTP: 1, tempOTPExpiry: 1 },
        lastLoginAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      throw createError(500, "Failed to complete login");
    }

    return {
      user: updatedUser,
      loginSuccess: true,
      message: `Login successful! Welcome back, ${updatedUser.fullName}.`,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `2FA verification failed: ${error.message}`);
  }
};

/**
 * Request password reset (Step 1)
 * @param email - User email
 * @returns Promise with reset request result
 */
export const requestPasswordReset = async (
  email: string
): Promise<{
  success: boolean;
  message: string;
  expiresAt?: Date;
}> => {
  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      return {
        success: true,
        message:
          "If an account with this email exists, a password reset code has been sent.",
      };
    }

    if (user.tempOTPExpiry) {
      const timeDiff = new Date().getTime() - user.tempOTPExpiry.getTime();
      if (timeDiff < 5 * 60 * 1000) {
        throw createError(
          429,
          "Please wait before requesting another password reset code"
        );
      }
    }

    const otpResult = await sendEmailOTP(email, "password-reset");

    if (!otpResult.success) {
      throw createError(500, "Failed to send password reset email");
    }

    await User.findByIdAndUpdate(user._id, {
      tempOTP: otpResult.otp,
      tempOTPExpiry: otpResult.expiresAt,
      passwordResetRequested: true,
    });

    return {
      success: true,
      message: "Password reset code sent to your email",
      expiresAt: otpResult.expiresAt,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(
      500,
      `Failed to request password reset: ${error.message}`
    );
  }
};

/**
 * Verify password reset OTP (Step 2)
 * @param email - User email
 * @param inputOTP - OTP entered by user
 * @returns Promise with verification result
 */
export const verifyPasswordResetOTP = async (
  email: string,
  inputOTP: string
): Promise<{
  isValid: boolean;
  userId?: string;
  message: string;
}> => {
  try {
    await validateOTPData({ email, otp: inputOTP });

    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
      passwordResetRequested: true,
    }).select("+tempOTP +tempOTPExpiry");

    if (!user) {
      throw createError(404, "Invalid reset request or user not found");
    }

    if (!user.tempOTP || !user.tempOTPExpiry) {
      throw createError(
        400,
        "Reset code not found or expired. Please request a new one."
      );
    }

    const verification = helpers.verifyTimedOTP(
      inputOTP,
      user.tempOTP,
      user.tempOTPExpiry
    );

    if (!verification.isValid) {
      throw createError(400, verification.message);
    }

    await User.findByIdAndUpdate(user._id, {
      otpVerified: true,
      $unset: { tempOTP: 1, tempOTPExpiry: 1 },
    });

    return {
      isValid: true,
      userId: user._id.toString(),
      message: "Reset code verified. You can now set a new password.",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to verify reset code: ${error.message}`);
  }
};

/**
 * Reset password with new password (Step 3)
 * @param userId - User ID
 * @param newPassword - New password
 * @param confirmPassword - Password confirmation
 * @returns Promise with reset result
 */
export const resetPassword = async (
  userId: string,
  newPassword: string,
  confirmPassword: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    if (newPassword !== confirmPassword) {
      throw createError(400, "Passwords do not match");
    }

    const passwordCheck = helpers.isStrongPassword(newPassword);
    if (!passwordCheck.isValid) {
      throw createError(400, passwordCheck.message);
    }

    const user = await User.findOne({
      _id: userId,
      isActive: true,
      passwordResetRequested: true,
      otpVerified: true,
    }).select("+password");

    if (!user) {
      throw createError(400, "Invalid reset session. Please start over.");
    }

    const isSamePassword = await helpers.comparePassword(
      newPassword,
      user.password
    );
    if (isSamePassword) {
      throw createError(
        400,
        "New password must be different from current password"
      );
    }

    const hashedPassword = await helpers.hashedPassword(newPassword);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      $unset: {
        passwordResetRequested: 1,
        otpVerified: 1,
      },
      lastPasswordChange: new Date(),
    });

    await sendPasswordResetConfirmationEmail(user.email, user.fullName);

    return {
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to reset password: ${error.message}`);
  }
};

/**
 * Change password for logged-in user
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @param confirmPassword - Password confirmation
 * @returns Promise with change result
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    if (newPassword !== confirmPassword) {
      throw createError(400, "New passwords do not match");
    }

    const passwordCheck = helpers.isStrongPassword(newPassword);
    if (!passwordCheck.isValid) {
      throw createError(400, passwordCheck.message);
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw createError(404, "User not found");
    }

    const isCurrentPasswordValid = await helpers.comparePassword(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      throw createError(401, "Current password is incorrect");
    }

    const isSamePassword = await helpers.comparePassword(
      newPassword,
      user.password
    );
    if (isSamePassword) {
      throw createError(
        400,
        "New password must be different from current password"
      );
    }

    const hashedPassword = await helpers.hashedPassword(newPassword);
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      lastPasswordChange: new Date(),
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to change password: ${error.message}`);
  }
};

/**
 * Resend OTP with rate limiting
 * @param email - User email
 * @param purpose - OTP purpose
 * @returns Promise with resend result
 */
export const resendOTP = async (
  email: string,
  purpose: "registration" | "login" | "password-reset" = "registration"
): Promise<{
  success: boolean;
  message: string;
  expiresAt?: Date;
}> => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw createError(404, "User not found");
    }

    if (user.tempOTPExpiry) {
      const timeDiff = new Date().getTime() - user.tempOTPExpiry.getTime();
      if (timeDiff < 60000) {
        throw createError(429, "Please wait before requesting another OTP");
      }
    }

    const otpResult = await sendEmailOTP(email, purpose);

    if (!otpResult.success) {
      throw createError(500, "Failed to send OTP");
    }

    await User.findByIdAndUpdate(user._id, {
      tempOTP: otpResult.otp,
      tempOTPExpiry: otpResult.expiresAt,
    });

    return {
      success: true,
      message: "New OTP sent successfully",
      expiresAt: otpResult.expiresAt,
    };
  } catch (error: any) {
    if (error.status) throw error;
    throw createError(500, `Failed to resend OTP: ${error.message}`);
  }
};
