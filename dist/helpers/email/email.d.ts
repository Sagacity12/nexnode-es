export declare const sendEmailOTP: (email: string, purpose?: "registration" | "login" | "password-reset" | "verification", otpLength?: number) => Promise<{
    success: boolean;
    otp?: string;
    expiresAt?: Date;
    message: string;
}>;
export declare const resendEmailOTP: (email: string, lastSentTime: Date, purpose?: "registration" | "login" | "password-reset" | "verification", cooldownMinutes?: number) => Promise<{
    success: boolean;
    otp?: string;
    expiresAt?: Date;
    message: string;
    canResendAt?: Date;
}>;
export declare const sendWelcomeEmail: (email: string, userfullName: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const sendPasswordResetConfirmationEmail: (email: string, userfullName: string) => Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=email.d.ts.map