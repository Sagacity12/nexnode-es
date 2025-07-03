import { IUserRegistration, IUserProfileUpdate, IUserLogin } from "../../common/interfaces/user";
export declare const validateAuthData: (data: IUserRegistration) => Promise<void>;
export declare const validateLoginData: (data: IUserLogin) => Promise<void>;
export declare const validateProfileData: (data: IUserProfileUpdate) => Promise<void>;
export declare const validatePasswordChange: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) => Promise<void>;
export declare const validateOTPData: (data: {
    otp: string;
    email?: string;
    phone?: string;
}) => Promise<void>;
//# sourceMappingURL=validate.d.ts.map