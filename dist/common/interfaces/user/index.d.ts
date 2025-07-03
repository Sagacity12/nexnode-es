import { Role } from '@/common/enums';
import { Document, Types } from 'mongoose';
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
    isPhoneVerified?: boolean;
    profilePicture?: string;
    preferences?: {
        emailNotifications?: boolean;
        smsNotifications?: boolean;
        propertyAlerts?: boolean;
    };
    tempOTP?: string;
    tempOTPExpiry?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    lastLoginAt?: Date;
    isActive?: boolean;
    isDeleted?: boolean;
    googleId?: string;
    authProvider?: string;
}
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
export interface IUserDocument extends IUser, Document {
}
export interface IUserRegistration {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role: Role;
    tempOTP?: string;
    tempOTPExpiry?: Date;
}
export interface googleAuthInput {
    fullName: string;
    email: string;
    profilepicture: string;
    googleToken: string;
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
    profilepicture?: string;
}
export interface IUserLogin {
    email: string;
    password: string;
}
export interface updateAuth {
    id: string | Types.ObjectId;
    opt: boolean;
}
export interface updatePasswordInput {
    id: string;
    password: string;
}
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
    };
    Address?: IAddress;
}
export interface IPasswordChange {
    currentPassword: string;
    newPassword: string;
}
export interface IUserQuery {
    role?: Role;
    isActive?: boolean;
    isEmailVerified?: boolean;
    city?: string;
    state?: string;
    createdAfter?: Date;
    createdBefore?: Date;
}
export interface IJWTPayload {
    userId: string;
    email: string;
    role?: Role;
    iat?: number;
    exp?: number;
}
export interface IAgent extends IUser {
    licenseNumber?: string;
    agencyName?: string;
    experienceYears?: number;
    specializations?: string[];
    commission?: number;
    rating?: number;
    totalSales?: number;
    verificationStatus?: AgentVerificationStatus;
}
export declare enum AgentVerificationStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
//# sourceMappingURL=index.d.ts.map