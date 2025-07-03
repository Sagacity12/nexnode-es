export declare const generateTwoFactorSecret: (length?: number) => string;
export declare const generateQRCodeImage: (otpauthUrl: string) => Promise<string>;
export declare const generateTwoFactorQRCode: (secret: string, label: string) => string;
export declare const generateTOTPCode: (secret: string, length?: number) => {
    otp: string;
    validFor: number;
    expiresAt: number;
};
export declare const verifyTOTPOrSimpleOTP: (inputOTP: string, secret?: string, storedOTP?: string, expiresAt?: Date) => {
    isValid: boolean;
    message: string;
};
export declare const generateTOTPSecret: (userEmail: string) => {
    secret: string;
    qrCodeUrl: string;
    manualEntryKey: string;
};
export declare const verifyTOTPToken: (token: string, secret: string) => boolean;
export declare const generateBackupCodes: (count?: number) => string[];
export declare const hashBackupCodes: (codes: string[]) => Promise<string[]>;
export declare const verifyBackupCode: (inputCode: string, hashedCodes: string[]) => Promise<boolean>;
//# sourceMappingURL=Two-factorAuth.d.ts.map