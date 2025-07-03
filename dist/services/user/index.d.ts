import { IUserDocument, IUserProfileUpdate, googleUserData } from "@common/interfaces/user/index";
import { FilterQuery, QueryOptions } from "mongoose";
export declare const getUserById: (userId: string) => Promise<IUserDocument>;
export declare const findUserByEmail: (email: string) => Promise<IUserDocument | null>;
export declare const getUserProfile: (userId: string) => Promise<{
    user: IUserDocument;
    message: string;
}>;
export declare const createGoogleUser: (data: googleUserData) => Promise<IUserDocument>;
export declare const updateUserProfile: (userId: string, updateData: IUserProfileUpdate) => Promise<{
    user: IUserDocument;
    message: string;
}>;
export declare const updateProfilePicture: (userId: string, profilePictureUrl: string) => Promise<{
    user: IUserDocument;
    message: string;
}>;
export declare const updateUserPreferences: (userId: string, preferences: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    propertyAlerts?: boolean;
}) => Promise<{
    user: IUserDocument;
    message: string;
}>;
export declare const getAllUsers: (filters?: FilterQuery<IUserDocument>, options?: QueryOptions) => Promise<{
    users: IUserDocument[];
    total: number;
    page: number;
    limit: number;
}>;
export declare const deleteUserAccount: (userId: string, password: string) => Promise<{
    success: boolean;
    message: string;
}>;
export declare const requestEmailVerification: (userId: string) => Promise<{
    success: boolean;
    message: string;
    expiresAt?: Date;
}>;
//# sourceMappingURL=index.d.ts.map