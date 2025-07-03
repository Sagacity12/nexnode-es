import crypto from 'crypto';
import bcrypt from 'bcrypt';
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';


/**
 * Generates a secret key for two-factor authentication.
 * @returns {string} The generated secret key.
 */
export const generateTwoFactorSecret = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
};



/**
 * Generates a QR code image for TOTP setup
 */
export const generateQRCodeImage = async (otpauthUrl: string): Promise<string> => {
    try{
        return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
        throw new Error(`Failed to generate QR code: ${error}`);
    }
};

/**
 * Generates a QR code URL for two-factor authentication.
 * @param secret - The secret key for two-factor authentication.
 * @param label - The label for the QR code, typically the user's email or username.
 * @returns {string} The generated QR code URL.
 */
export const generateTwoFactorQRCode = (secret: string, label: string): string => {
   return speakeasy.otpauthURL({
    secret: secret,
    label: label,
    issuer: 'Nexnode Real Estate', 
    encoding: 'base32'
   });
};

/**
 * Generate time-based one-time password (TOTP) using the secret key.
 * @param secret - The secret key for two-factor authentication.
 * @returns {string} The generated OTP.
 */
export const generateTOTPCode = (secret: string, length: number = 6): { otp: string; validFor: number; expiresAt: number } => {
    const otp = speakeasy.totp({
        secret: secret,
        encoding: 'base32',
        digits: length,
        step: 30 
    });
    const validFor = 30; 
    const expiresAt = Date.now() + validFor * 1000; 

    return { otp, validFor, expiresAt };
};

/**
 * Verify TOTP  token (for authentication apps) - FIXED VERSION
 * @param inputOTP - The OTP input by the user.
 * @param secret - The secret key used to generate the OTP.
 * @param storedOTP - The OTP stored in the database or generated previously.
 * @param expiresAt - The expiration time of the OTP.
 * @return {Object} An object containing the validity status and a message.
 */
export const verifyTOTPOrSimpleOTP = (
    inputOTP: string, 
    secret?: string, 
    storedOTP?: string, 
    expiresAt?: Date
): { isValid: boolean; message: string } => {
    if (storedOTP && expiresAt) {
        if (new Date() > expiresAt) {
            return { isValid: false, message: 'OTP has expired' };
        }

        if (inputOTP === storedOTP) {
            return { isValid: true, message: 'Simple OTP verified successfully' };
        }
    }
    if (secret) {
    const isTOTPValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: inputOTP,
        window: 2, 
        time: Math.floor(Date.now() / 1000) 
    });

    if (isTOTPValid) {
        return { isValid: true, message: 'TOTP verified successfully' };
        }
    }

    return { isValid: false, message: 'Invalid OTP' };
};

   // if (isValid) {
    //    return { isValid: true, message: 'OTP verified successfully' };
  //  } else {
    //    return { isValid: false, message: 'Invalid OTP' };
   // }

 

/**
 * Generates TOTP secret for authentication apps ( Google Authenticator, Authy, etc.)
 * @param userEmail - The user's email address.
 * @returns {string} The generated TOTP secret.
 */
export const generateTOTPSecret = (userEmail: string): { 
    secret: string; 
    qrCodeUrl: string;
    manualEntryKey: string;
    } => {

    const secret = speakeasy.generateSecret({
        name: `Nexnode Real Estate (${userEmail})`,
        length: 32,
        issuer: 'Nexnode Real Estate',
});

return {
    secret: secret.base32 || '',
        qrCodeUrl: secret.otpauth_url || '',
        manualEntryKey: secret.base32 || '',
    };
};

/** 
 * Verify TOTP token for from authentication apps
 * @param token - The TOTP token to verify.
 * @param secret - The TOTP secret used to generate the token.
 * @returns {boolean} True if the token is valid, false otherwise.
 */
export const verifyTOTPToken = (token: string, secret: string): boolean => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2, 
    });
};

/**
 * Generates backup codes for two-factor authentication.
 * @param count - The number of backup codes to generate.
 * @returns {string[]} An array of generated backup codes.
 */
export const generateBackupCodes = (count: number = 10): string[] => {
    const backupCodes: string[] = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase(); 
        backupCodes.push(code);
    }
    return backupCodes;
};

/**
 * Hash backup codes for secure storage.
 * @param codes - An array of backup codes to hash.
 * @returns {string[]} An array of hashed backup codes.
 */
export const hashBackupCodes = async (codes: string[]): Promise<string[]> => {
   // const hashedCodes = await Promise.all(codes.map(code => bcrypt.hash(code, 10)));
        return Promise.all(codes.map(code => bcrypt.hash(code, 10)));
};

/**
 * Verifies a backup code against the stored hash.
 * @param code - The backup code to verify.
 * @param hash - The hashed backup code to compare against.
 * @returns {boolean} True if the backup code matches the hash, false otherwise.
 */
export const verifyBackupCode = async (inputCode: string, hashedCodes: string[]): Promise<boolean> => {
    for (const hashedCode of hashedCodes) {
        if (await bcrypt.compare(inputCode, hashedCode)) {
            return true; 
        }
    }
    return false;
};