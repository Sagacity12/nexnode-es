export declare const formatPhoneNumber: (phone: string, countryCode?: string) => string;
export declare const sendSMSOTP: (phoneNumber: string, purpose?: "registration" | "login" | "password-reset" | "verification", otpLength?: number) => Promise<{
    success: boolean;
    otp?: string;
    expiresAt?: Date;
    message: string;
}>;
export declare const resendSMSOTP: (phoneNumber: string, lastSentTime: Date, purpose?: "registration" | "login" | "password-reset" | "verification", cooldownMinutes?: number) => Promise<{
    success: boolean;
    otp?: string;
    expiresAt?: Date;
    message: string;
    canResendAt?: Date;
}>;
export declare const sendPropertyAlertSMS: (phoneNumber: string, propertyTitle: string, price: string, location: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const sendAppointmentReminderSMS: (phoneNumber: string, propertyTitle: string, appointmentTime: string, agentfullName: string) => Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=SMSOTP.d.ts.map