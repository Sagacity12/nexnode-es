import { NextFunction, Response } from 'express';
import { HttpError } from 'http-errors';
export declare const hashedPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
export declare const jwtSign: (obj: object) => Promise<string>;
export declare const jwtVerify: (token: string) => any;
export declare const verifySocketToken: (socket: any, next: NextFunction) => Promise<void>;
export declare const generateOTP: (length: number) => string;
export declare const generateTimedOTP: (length?: number) => {
    otp: string;
    expiresAt: Date;
};
export declare const verifyTimedOTP: (inputOTP: string, storedOTP: string, expiresAt: Date) => {
    isValid: boolean;
    message: string;
};
export declare const generateSecureToken: (length?: number) => string;
export declare const canRequestOTP: (lastRequestTime: Date, cooldownMinutes?: number) => boolean;
export declare const isValidPhone: (phone: string) => boolean;
export declare const isStrongPassword: (password: string) => {
    isValid: boolean;
    message: string;
};
export declare const sanitizeInput: (input: string) => string;
export declare const isValidPriceRange: (price: number) => boolean;
export declare const isValidCoordinates: (latitude: number, longitude: number) => boolean;
export declare const constructHttpErrorResponse: (data?: any, error?: null | HttpError, statusCode?: number) => (res: Response) => Response<any, Record<string, any>>;
//# sourceMappingURL=helper.d.ts.map