import { googleAuthInput } from "../../../common/interfaces/user/index";
import { IUserDocument } from "../../../common/interfaces/user/index";
export declare const googleAuth: (data: googleAuthInput) => Promise<{
    user: IUserDocument;
    isNewUser: boolean;
    loginSuccess: boolean;
    message: string;
}>;
export declare const linkGoogleAccount: (userId: string, googleToken: string) => Promise<{
    success: boolean;
    message: string;
    user: IUserDocument;
}>;
export declare const unlinkGoogleAccount: (userId: string, password: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const setPasswordForGoogleUser: (userId: string, newPassword: string, confirmPassword: string) => Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=googleAuth.d.ts.map