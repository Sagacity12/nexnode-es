
import { Document, Types } from 'mongoose';
import { Role } from 'src/common/enums';

// Base user interface with common properties
export interface IUser {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  Biography?: string;
  passwordResetRequested: boolean;
  otpVerified: boolean;
  lastPasswordChange?: Date;
  isEmailVerified?: boolean;
  is2FAEnabled?: boolean;
  isPhoneVerified?: boolean;
  profilePicture?: string;
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    propertyAlerts?: boolean;
  };
  
  tempOTP?: string;
  tempOTPExpiry?: Date;
  // dateOfBirth?: Date;
  //address?: IAddress;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  isActive?: boolean;
  isDeleted?: boolean;
  googleId?: string;
  authProvider?: string;
}

interface IAuthResult {
  requires2FA: boolean;
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

// Address interface for user location
export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

// Extended interface for Mongoose document
export interface IUserDocument extends IUser, Document {}

// Interface for user registration
export interface IUserRegistration {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  tempOTP?: string;
  tempOTPExpiry?: Date;
  //dateOfBirth?: Date;
  //address?: IAddress;
}

export interface googleAuthInput {
    fullName: string 
    email: string  
    profilepicture: string  
    googleToken: string
    role: Role;
    phone?: string; 
    googleId?: string; 
    AuthProvider?: string; 
    isEmailVerified?: boolean; 
}
 export interface googleUserData {
  fullName: string;
  email: string;
  role: Role;
  profilepicture?: string
 }

// Interface for user login
export interface IUserLogin {
  email: string;
  password: string;
}

export interface updateAuth {
    id: string | Types.ObjectId
    opt: boolean
}

export interface updatePasswordInput {
  id: string;
  password: string;
}

// Interface for user profile update
export interface IUserProfileUpdate {
  email?: string;
  fullName?: string;
  phone?: string;
  profilePicture?: string;
  Bio?: string;
  preferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    propertyAlerts?: boolean;
  }
  Address?: IAddress;
 // dateOfBirth?: Date;
  //address?: IAddress;
}

// Interface for password change
export interface IPasswordChange {
  currentPassword: string;
  newPassword: string;
}

// Interface for user query/filter
export interface IUserQuery {
  role?: Role;
  isActive?: boolean;
  isEmailVerified?: boolean;
  city?: string;
  state?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// Interface for JWT payload
export interface IJWTPayload {
  userId: string;
  email: string;
  role?: Role;
  iat?: number;
  exp?: number;
}

// Agent-specific interface (extends IUser)
export interface IAgent extends IUser {
  licenseNumber?: string;
  agencyName?: string;
  experienceYears?: number;
  specializations?: string[];
  commission?: number; // percentage
  rating?: number;
  totalSales?: number;
  verificationStatus?: AgentVerificationStatus;
}

export enum AgentVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}