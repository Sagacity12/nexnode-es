import { Types } from 'mongoose';
import { Role } from '../../enums/index';
export interface IAuthResponse {
    success: boolean;
    message: string;
    user?: IAuthUser;
    token?: string;
    refreshToken?: string;
}
export interface IAuthUser {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    profilePicture?: string;
    createdAt: Date;
    lastLoginAt?: Date;
}
export interface ILoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface IRegisterRequest {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    role?: Role;
    termsAccepted: boolean;
}
export interface IEmailVerification {
    email: string;
    verificationCode: string;
}
export interface IPhoneVerification {
    phone: string;
    verificationCode: string;
}
export interface IPasswordResetRequest {
    email: string;
}
export interface IPasswordReset {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}
export interface IRefreshTokenRequest {
    refreshToken: string;
}
export interface ISession {
    userId: string;
    sessionId: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
    expiresAt: Date;
    isActive: boolean;
}
export interface ITwoFactorAuth {
    userId: string;
    secret: string;
    isEnabled: boolean;
    backupCodes: string[];
}
export interface IVerificationToken {
    userId: string;
    token: string;
    type: VerificationTokenType;
    expiresAt: Date;
    isUsed: boolean;
}
export declare enum VerificationTokenType {
    EMAIL_VERIFICATION = "email_verification",
    PHONE_VERIFICATION = "phone_verification",
    PASSWORD_RESET = "password_reset",
    TWO_FACTOR_AUTH = "two_factor_auth"
}
export interface Auth {
    _id: Types.ObjectId;
    userId: string | Types.ObjectId;
    token: string;
    refreshToken: string;
    expiresAt: Date;
    expiresIn: Date;
}
//# sourceMappingURL=index.d.ts.map