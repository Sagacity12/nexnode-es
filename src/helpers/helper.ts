import bcrypt  from 'bcrypt';
import jwt from 'jsonwebtoken';
//import crypto from 'crypto';
import { NextFunction, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';


/**
 * * Hashes a password using bcrypt.
 * * @param password - The password to hash.    
 * * @returns A promise that resolves to the hashed password.
 */
export const hashedPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

/**
 * Compares a password with a hashed password.
 * @param password - The plain text password to compare.
 * @param hash - The hashed password to compare against.
 * @returns A promise that resolves to a boolean indicating whether the passwords match.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

/**
 * JWT Signing function.
 * @param abject - The object to sign.
 * * @returns A promise that resolves to the signed JWT token.
 */
export const jwtSign = async (obj: object): Promise<string> => {
    return jwt.sign(obj, `${process.env.JWT_SECRET}`, {expiresIn: '1d'});  
}

export const jwtVerify = (token: string): any => {
    return jwt.verify(token, `${process.env.JWT_SECRET}`);
};

/**
 * Socket.IO error handler middleware.
 * @param socket - The socket instance.
 * @param next - The next middleware function.
 * @returns A promise that resolves to void.
 */
export const verifySocketToken = async (socket: any, next: NextFunction): Promise<void> => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) throw new createHttpError.Forbidden("Forbidden: No token provided");
        const data = jwtVerify(token);
        if(!data.id) throw new createHttpError.Unauthorized("Unauthorized: Invalid token");
    } catch (error) {
        const err = error as HttpError;
        next(err);
    }
};

/**
 * generate a random otp of a given lenght for verification 
 * @param length - The length of the OTP to generate.
 * @returns otp code : A promise that resolves to the generated OTP. 
 */
export const generateOTP = (length: number): string => {
    const digits = '0123456789';
    const Length = digits.length;
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits.charAt(Math.floor(Math.random() * Length)); 
    }
    return otp;
};

/**
 * Generates timed OTP with expiration
 * @param length - The lenth of the OTP to generate.
 * @returns object with OTP and expiration time 
 */
export const generateTimedOTP = (length: number = 6): { otp: string; expiresAt: Date } => {
    const otp = generateOTP(length);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
    return { otp, expiresAt };  
};

/**
 * Verify time OTP with expireation check
 * @param inputOTP - The OTP entered by user 
 * @param storedOTP -  The OTP stored in database 
 * @param expiresAt - When the OTP expires
 * @returns Verification result
 */
export const verifyTimedOTP = (
    inputOTP: string, 
    storedOTP: string,
    expiresAt: Date
): { isValid: boolean; message: string } => {
    if (new Date() > expiresAt) {
        return { isValid: false, message:  'OTP has expired. Please request a new one'};
    }

    if (inputOTP === storedOTP) {
        return { isValid: true, message: 'OTP verified successfully' };
    } else {
        return { isValid: false, message: 'Invalid OTP. Please try again' };
    }
};

/**
 * Generate secure token for email verification
 * @param length - Token length in bytes
 * @returns Secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex'); 
}

/**
 * Rate limiting helper for OTP requests 
 * @param lastRequestTime - When OTP was last requested 
 * @param cooldownMinutes - Cool period in minutes
 * @returns Whether new OTP can be requested
 */
export const canRequestOTP = (lastRequestTime: Date, cooldownMinutes: number = 5): boolean => {
    const now = new Date();
    const timeDiff = now.getTime() - lastRequestTime.getTime();
    const cooldownMillis = cooldownMinutes * 60 * 1000;
    return timeDiff >= cooldownMillis;
};


/**
 * Phone number validation
 * @param phone - The phone number to validate.
 * @returns A boolean indicating whether the phone number is valid.
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; 
    return phoneRegex.test(phone);
};

/**
 * Password strength validation
 * @param password - The password to validate.
 * @returns A boolean indicating whether the password is strong enough.
 */
export const isStrongPassword = (password: string): { isValid: boolean; message: string } => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: `Password must be at least ${minLength} characters long.` };
    }
    if (!hasUpperCase) {
        return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
    }
    if (!hasLowerCase) {
        return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
    }
    if (!hasNumbers) {
        return { isValid: false, message: 'Password must contain at least one number.' };
    }
    if (!hasSpecialChars) {
        return { isValid: false, message: 'Password must contain at least one special character.' };
    }

    return { isValid: true, message: 'Password is strong.' };
}

/**
 * Sanitize input to prevent XSS attacks.
 * @param input - The input string to sanitize.
 * @returns The sanitized input string.
 */
export const sanitizeInput = (input: string): string => {
    return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Validate property price range.
 * @param price - The price to validate.
 * @returns A boolean indicating whether the price is valid.
 */
export const isValidPriceRange = (price: number): boolean => {
    const minPrice = 0;
    const maxPrice = 10000000; 
    return price >= minPrice && price <= maxPrice;
};

/**
 * Validate coordinates for latitude and longitude.
 * @param latitude - The latitude to validate.
 * @param longitude - The longitude to validate.
 * @returns A boolean indicating whether the coordinates are valid.
 */
export const isValidCoordinates = (latitude: number, longitude: number): boolean => {
    const minLatitude = -90;
    const maxLatitude = 90;
    const minLongitude = -180;
    const maxLongitude = 180;

    return (
        latitude >= minLatitude &&
        latitude <= maxLatitude &&
        longitude >= minLongitude &&
        longitude <= maxLongitude
    );
};

/**
 * Construct Http Error 
 * @param data 
 * @param error
 * @param statusCode 
 * @return 
 */
export const constructHttpErrorResponse = (
    data: any = null,
    error: null | HttpError = null,
    statusCode: number = 200
) => {
    return (res: Response) => {
        if (error) {
            return res.status(statusCode).json({
                error: {
                    message: error.message,
                    statusCode: error.statusCode || statusCode 
                }
            });
        }
        return res.status(statusCode).json({
            data,
            statusCode
        });
    }
};