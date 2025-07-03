"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAppointmentReminderSMS = exports.sendPropertyAlertSMS = exports.resendSMSOTP = exports.sendSMSOTP = exports.formatPhoneNumber = void 0;
const twilio_1 = __importDefault(require("twilio"));
const helper_1 = require("@/helpers/helper");
const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const formatPhoneNumber = (phone, countryCode = "+233") => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    if (cleaned.startsWith("0")) {
        return countryCode + cleaned.substring(1);
    }
    if (!cleaned.startsWith("+")) {
        return countryCode + cleaned;
    }
    return cleaned;
};
exports.formatPhoneNumber = formatPhoneNumber;
const sendSMSOTP = async (phoneNumber, purpose = "verification", otpLength = 6) => {
    try {
        const { otp, expiresAt } = (0, helper_1.generateTimedOTP)(otpLength);
        const formattedPhone = (0, exports.formatPhoneNumber)(phoneNumber);
        const messages = {
            registration: `Welcome to Nexnode! 🏠 Your verification code: ${otp}. Valid for 10 minutes. Don't share this code.`,
            login: `Your Nexnode login code: ${otp}. Valid for 10 minutes. Keep this code private for your security.`,
            "password-reset": `Your Nexnode password reset code: ${otp}. Valid for 10 minutes. If you didn't request this, ignore this message.`,
            verification: `Your Nexnode verification code: ${otp}. Valid for 10 minutes.`,
        };
        await twilioClient.messages.create({
            body: messages[purpose],
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone,
        });
        console.log(`SMS OTP sent successfully to ${formattedPhone} for ${purpose}`);
        return {
            success: true,
            otp,
            expiresAt,
            message: "OTP sent successfully to your phone",
        };
    }
    catch (error) {
        console.error(`Failed to send SMS OTP to ${phoneNumber}:`, error);
        return {
            success: false,
            message: "Failed to send SMS OTP. Please try email verification instead.",
        };
    }
};
exports.sendSMSOTP = sendSMSOTP;
const resendSMSOTP = async (phoneNumber, lastSentTime, purpose = "verification", cooldownMinutes = 1) => {
    try {
        const now = new Date();
        const timeDiff = now.getTime() - lastSentTime.getTime();
        const cooldownMs = cooldownMinutes * 60 * 1000;
        if (timeDiff < cooldownMs) {
            const canResendAt = new Date(lastSentTime.getTime() + cooldownMs);
            return {
                success: false,
                message: `Please wait ${cooldownMinutes} minute(s) before requesting another SMS`,
                canResendAt,
            };
        }
        return await (0, exports.sendSMSOTP)(phoneNumber, purpose);
    }
    catch (error) {
        console.error(`Failed to resend SMS OTP to ${phoneNumber}:`, error);
        return {
            success: false,
            message: "Failed to resend SMS. Please try again.",
        };
    }
};
exports.resendSMSOTP = resendSMSOTP;
const sendPropertyAlertSMS = async (phoneNumber, propertyTitle, price, location) => {
    try {
        const formattedPhone = (0, exports.formatPhoneNumber)(phoneNumber);
        const message = `🏠 Nexnode Alert: New "${propertyTitle}" in ${location}. Price: ${price}. Check our app for details and photos!`;
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone,
        });
        console.log(`Property alert SMS sent to ${formattedPhone}`);
        return {
            success: true,
            message: "Property alert sent successfully",
        };
    }
    catch (error) {
        console.error(`Failed to send property alert SMS to ${phoneNumber}:`, error);
        return {
            success: false,
            message: "Failed to send property alert",
        };
    }
};
exports.sendPropertyAlertSMS = sendPropertyAlertSMS;
const sendAppointmentReminderSMS = async (phoneNumber, propertyTitle, appointmentTime, agentfullName) => {
    try {
        const formattedPhone = (0, exports.formatPhoneNumber)(phoneNumber);
        const message = `📅 Nexnode Reminder: Property viewing for "${propertyTitle}" with ${agentfullName} at ${appointmentTime}. See you there!`;
        await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone,
        });
        console.log(`Appointment reminder SMS sent to ${formattedPhone}`);
        return {
            success: true,
            message: "Appointment reminder sent successfully",
        };
    }
    catch (error) {
        console.error(`Failed to send appointment reminder SMS to ${phoneNumber}:`, error);
        return {
            success: false,
            message: "Failed to send appointment reminder",
        };
    }
};
exports.sendAppointmentReminderSMS = sendAppointmentReminderSMS;
//# sourceMappingURL=SMSOTP.js.map