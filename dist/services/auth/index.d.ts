import { IUserLogin, IUserDocument, IUserRegistration } from "@common/interfaces/user/index";
export declare const checkUserExists: (email: string, phone?: string) => Promise<boolean>;
export declare const registerUser: (data: IUserRegistration) => Promise<{
    user: IUserDocument;
    emailOTP: string;
    otpExpiry: Date;
    message: string;
}>;
export declare const verifyEmailOTP: (email: string, inputOTP: string) => Promise<{
    user: IUserDocument;
    message: string;
}>;
export declare const authenticateCredentials: (loginData: IUserLogin) => Promise<{
    user: IUserDocument;
    requires2FA: boolean;
    message: string;
}>;
export declare const generateLogin2FA: (userId: string, method?: "email" | "sms") => Promise<{
    otpSent: boolean;
    expiresAt: Date;
    method: string;
    message: string;
}>;
export declare const verifyLogin2FA: (userId: string, inputOTP: string) => Promise<{
    user: IUserDocument;
    loginSuccess: boolean;
    message: string;
}>;
export declare const requestPasswordReset: (email: string) => Promise<{
    success: boolean;
    message: string;
    expiresAt?: Date;
}>;
export declare const verifyPasswordResetOTP: (email: string, inputOTP: string) => Promise<{
    isValid: boolean;
    userId?: string;
    message: string;
}>;
export declare const resetPassword: (userId: string, newPassword: string, confirmPassword: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const changePassword: (userId: string, currentPassword: string, newPassword: string, confirmPassword: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const resendOTP: (email: string, purpose?: "registration" | "login" | "password-reset") => Promise<{
    success: boolean;
    message: string;
    expiresAt?: Date;
}>;
//# sourceMappingURL=index.d.ts.map