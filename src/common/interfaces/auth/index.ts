import { Types } from 'mongoose';
import { Role } from '../../enums/index';
//import { IUser, UserRole } from '../user';

// Auth response interface
export interface IAuthResponse {
  success: boolean;
  message: string;
  user?: IAuthUser;
  token?: string;
  refreshToken?: string;
}

// Simplified user data for auth responses (without sensitive info)
export interface IAuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  //role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePicture?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Login request interface
export interface ILoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Registration request interface
export interface IRegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  role?: Role;
  termsAccepted: boolean;
}

// Email verification interface
export interface IEmailVerification {
  email: string;
  verificationCode: string;
}

// Phone verification interface
export interface IPhoneVerification {
  phone: string;
  verificationCode: string;
}

// Password reset request interface
export interface IPasswordResetRequest {
  email: string;
}

// Password reset interface
export interface IPasswordReset {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

// Refresh token interface
export interface IRefreshTokenRequest {
  refreshToken: string;
}

// Session interface
export interface ISession {
  userId: string;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Two-factor authentication interface
export interface ITwoFactorAuth {
  userId: string;
  secret: string;
  isEnabled: boolean;
  backupCodes: string[];
}

// Verification token interface
export interface IVerificationToken {
  userId: string;
  token: string;
  type: VerificationTokenType;
  expiresAt: Date;
  isUsed: boolean;
}

export enum VerificationTokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  PASSWORD_RESET = 'password_reset',
  TWO_FACTOR_AUTH = 'two_factor_auth'
}

// Auth interface
export interface Auth {
    _id: Types.ObjectId;
    userId: string | Types.ObjectId
    token: string
    refreshToken: string
    expiresAt: Date
    expiresIn: Date
}