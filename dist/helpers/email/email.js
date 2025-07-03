"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetConfirmationEmail = exports.sendWelcomeEmail = exports.resendEmailOTP = exports.sendEmailOTP = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const helper_1 = require("@/helpers/helper");
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendEmailOTP = async (email, purpose = "verification", otpLength = 6) => {
    try {
        console.log(`Sending email via SendGrid...`);
        console.log('To:', email);
        console.log('Purpose', purpose);
        if (!process.env.SENDGRID_API_KEY) {
            console.error('SENDGRID_API_KEY not found');
            return {
                success: false,
                message: "Email service not configured"
            };
        }
        const { otp, expiresAt } = (0, helper_1.generateTimedOTP)(otpLength);
        console.log(" Generated OTP:", otp);
        const subjects = {
            registration: "Nexnode - Welcome! Verify Your Email",
            login: "Nexnode - Login Verification Code",
            "password-reset": "Nexnode - Password Reset Code",
            verification: "Nexnode - Email Verification Code",
        };
        const messages = {
            registration: `Welcome to Nexnode Real Estate! 🏠\n\nYour email verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nPlease enter this code to activate your account and start exploring properties.\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nNexnode Team`,
            login: `Your Nexnode login verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nFor your security, don't share this code with anyone.\n\nIf you didn't attempt to log in, please secure your account immediately.\n\nBest regards,\nNexnode Team`,
            "password-reset": `You requested to reset your Nexnode password.\n\nYour password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this password reset, please ignore this email and your password will remain unchanged.\n\nBest regards,\nNexnode Team`,
            verification: `Your Nexnode verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nPlease enter this code to complete your verification.\n\nBest regards,\nNexnode Team`,
        };
        const msg = {
            to: email,
            from: {
                email: process.env.FROM_EMAIL || "esaga5688@gmail.com",
                name: process.env.FROM_NAME || "Nexnode Real Estate"
            },
            subject: subjects[purpose],
            text: messages[purpose],
        };
        await mail_1.default.send(msg);
        console.log(`Email OTP sent successfully to ${email} for ${purpose}`);
        return {
            success: true,
            otp,
            expiresAt,
            message: "OTP sent successfully to your email",
        };
    }
    catch (error) {
        console.error(`Failed to send email OTP to ${email}:`, error);
        if (error.response && error.response.body) {
            console.error("SendGrid error details:", error.response.body);
        }
        return {
            success: false,
            message: "Failed to send OTP email. Please try again.",
        };
    }
};
exports.sendEmailOTP = sendEmailOTP;
const resendEmailOTP = async (email, lastSentTime, purpose = "verification", cooldownMinutes = 1) => {
    try {
        const now = new Date();
        const timeDiff = now.getTime() - lastSentTime.getTime();
        const cooldownMs = cooldownMinutes * 60 * 1000;
        if (timeDiff < cooldownMs) {
            const canResendAt = new Date(lastSentTime.getTime() + cooldownMs);
            return {
                success: false,
                message: `Please wait ${cooldownMinutes} minute(s) before requesting another OTP`,
                canResendAt,
            };
        }
        return await (0, exports.sendEmailOTP)(email, purpose);
    }
    catch (error) {
        console.error(`Failed to resend email OTP to ${email}:`, error);
        return {
            success: false,
            message: "Failed to resend OTP. Please try again.",
        };
    }
};
exports.resendEmailOTP = resendEmailOTP;
const sendWelcomeEmail = async (email, userfullName) => {
    try {
        const welcomeMessage = `Dear ${userfullName},

Welcome to Nexnode Real Estate! 🏠

Your account has been successfully verified and activated.

You can now:
• Browse thousands of properties
• Save your favorite listings
• Contact agents directly
• Set up property alerts
• And much more!

Our platform will be launching soon! We'll notify you as soon as it's available.

In the meantime, if you have any questions, our support team is here to help.

Best regards,
The Nexnode Team`;
        const msg = {
            to: email,
            from: {
                email: process.env.FROM_EMAIL || "esaga5688@gmail.com",
                name: process.env.FROM_NAME || "Nexnode Real Estate",
            },
            subject: "🎉 Welcome to Nexnode Real Estate!",
            text: welcomeMessage,
        };
        await mail_1.default.send(msg);
        console.log(`Welcome email sent to ${email}`);
        return {
            success: true,
            message: "Welcome email sent successfully",
        };
    }
    catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
        return {
            success: false,
            message: "Failed to send welcome email",
        };
    }
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetConfirmationEmail = async (email, userfullName) => {
    try {
        const confirmationMessage = `Dear ${userfullName},

Your Nexnode Real Estate account password has been successfully reset.

Security Information:
• Password reset completed at: ${new Date().toLocaleString()}
• If you did not request this password reset, please contact our support team immediately

For your security:
• Never share your password with anyone
• Use a unique password for your Nexnode account
• Consider enabling two-factor authentication

If you have any security concerns, please contact us immediately at security@nexnode.com

Best regards,
The Nexnode Security Team

---
This is an automated security notification. Please do not reply to this email.`;
        const msg = {
            to: email,
            from: {
                email: process.env.FROM_EMAIL || "esaga5688@gmail.com",
                name: "Nexnode Security Team"
            },
            subject: "🔒 Password Reset Confirmation - Nexnode Real Estate",
            text: confirmationMessage,
        };
        await mail_1.default.send(msg);
        console.log(`Password reset confirmation email sent to ${email}`);
        return {
            success: true,
            message: "Password reset confirmation email sent successfully"
        };
    }
    catch (error) {
        console.error(`Failed to send password reset confirmation to ${email}:`, error);
        return {
            success: false,
            message: "Failed to send confirmation email"
        };
    }
};
exports.sendPasswordResetConfirmationEmail = sendPasswordResetConfirmationEmail;
//# sourceMappingURL=email.js.map