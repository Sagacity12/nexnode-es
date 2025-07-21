import { NextFunction, Request, Response } from "express";
import { constructHttpErrorResponse, generateOTP } from "../helpers/helper";
import {
  registerUser,
  verifyEmailOTP,
  authenticateCredentials,
  generateLogin2FA,
  verifyLogin2FA,
  requestPasswordReset,
  verifyPasswordResetOTP,
  resetPassword,
  changePassword,
  resendOTP,
} from "../services/auth/index";
import {
  googleAuth,
  linkGoogleAccount,
  unlinkGoogleAccount,
} from "../services/auth/Oauth2/googleAuth";
import { IUserLogin } from "src/common/interfaces/user";

/**
 * User Registration 
 * @param req - Express Request object containing user data
 * @param res - Express Response object to send the response
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUser(req.body);

    constructHttpErrorResponse(
      {
        success: true,
        message: result.message,
        userId: result.user._id,
        otpExpiry: result.otpExpiry,
      },
      null,
      201
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 500)(res);
  }
};

/**
 * Verify Email OTP 
 * @param req - Express Request object containing email and OTP
 * @param res - Express Response object to send the response
 */
export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const result = await verifyEmailOTP(email, otp);

    constructHttpErrorResponse(
      {
        success: true,
        message: result.message,
        user: {
          id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
          isEmailVerified: result.user.isEmailVerified,
        },
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Login - User Login
 * @param req - 
 * @param res -
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loginData: IUserLogin = req.body;
    const authResult = await authenticateCredentials(loginData);

    if (!authResult.user || !authResult.user._id) {
      throw new Error("Invalid user data received from authentication");
    }

      const twoFAResult = await generateLogin2FA(
        authResult.user._id.toString(), "email"
      );

       return constructHttpErrorResponse(
      {
        success: true,
        message:
          "2FA code sent to your email. Please verify to complete login.",
        requiresAuth: true,
        userId: authResult.user._id,
        otpExpiresAt: twoFAResult.expiresAt,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 401)(res);
  }
};

/**
 * Generate 2FA OTP for Login 
 * 
 */
export const generateLoginOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, method = "email" } = req.body;
    const result = await generateLogin2FA(userId, method);

    constructHttpErrorResponse(
      {
        success: true,
        message: result.message,
        otpSent: result.otpSent,
        method: result.method,
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
 * Verify 2FA OTP and Complete Login 
 *
 */
export const verifyLoginOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, otp } = req.body;
    const result = await verifyLogin2FA(userId, otp);

    
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      {
        id: result.user._id,
        email: result.user.email,
        role: result.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    constructHttpErrorResponse(
      {
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
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Google OAuth Authentication
 *
 */
export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await googleAuth(req.body);

   
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      {
        id: result.user._id,
        email: result.user.email,
        role: result.user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    constructHttpErrorResponse(
      {
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
      },
      null,
      result.isNewUser ? 201 : 200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Link Google Account to Existing User
 * 
 */
export const linkGoogle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id; 
    const { googleToken } = req.body;

    const result = await linkGoogleAccount(userId, googleToken);

    constructHttpErrorResponse(
      {
        success: result.success,
        message: result.message,
        user: {
          id: result.user._id,
          fullName: result.user.fullName,
          email: result.user.email,
          authProvider: result.user.authProvider,
          profilePicture: result.user.profilePicture,
        },
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Unlink Google Account
 * 
 */
export const unlinkGoogle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    const result = await unlinkGoogleAccount(userId, password);

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
 * Request Password Reset
 * 
 */
export const requestPasswordResetController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email);

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
 * Verify Password Reset OTP (Step 2)
 * 
 */
export const verifyPasswordResetController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const result = await verifyPasswordResetOTP(email, otp);

    constructHttpErrorResponse(
      {
        success: true,
        isValid: result.isValid,
        message: result.message,
        userId: result.userId,
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, error.status || 400)(res);
  }
};

/**
 * Reset Password (Step 3)
 * 
 */
export const resetPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;
    const result = await resetPassword(userId, newPassword, confirmPassword);

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
 * Change Password 
 *
 */
export const changePasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const result = await changePassword(
      userId,
      currentPassword,
      newPassword,
      confirmPassword
    );

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
 * Resend OTP
 * 
 */
export const resendOTPController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, purpose = "registration" } = req.body;
    const result = await resendOTP(email, purpose);

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
    constructHttpErrorResponse(null, error, error.status || 429)(res);
  }
};

/**
 * Logout 
 * 
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // For JWT, logout is handled on frontend by removing token
    constructHttpErrorResponse(
      {
        success: true,
        message: "Logged out successfully",
      },
      null,
      200
    )(res);
  } catch (error: any) {
    constructHttpErrorResponse(null, error, 500)(res);
  }
};
