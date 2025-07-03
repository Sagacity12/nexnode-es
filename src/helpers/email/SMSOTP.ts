import twilio from "twilio";
import { generateTimedOTP } from "@/helpers/helper";

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Format phone number for international SMS
 * @param phone - Phone number to format
 * @param countryCode - Default country code
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
  phone: string,
  countryCode: string = "+233"
): string => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");

  if (cleaned.startsWith("0")) {
    return countryCode + cleaned.substring(1);
  }
  if (!cleaned.startsWith("+")) {
    return countryCode + cleaned;
  }
  return cleaned;
};

/**
 * Send OTP via SMS
 * @param phoneNumber - Recipient phone number
 * @param purpose - Purpose of OTP
 * @param otpLength - Length of OTP to generate
 * @returns Promise with result
 */
export const sendSMSOTP = async (
  phoneNumber: string,
  purpose:
    | "registration"
    | "login"
    | "password-reset"
    | "verification" = "verification",
  otpLength: number = 6
): Promise<{
  success: boolean;
  otp?: string;
  expiresAt?: Date;
  message: string;
}> => {
  try {
   
    const { otp, expiresAt } = generateTimedOTP(otpLength);

  
    const formattedPhone = formatPhoneNumber(phoneNumber);

    
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

    console.log(
      `SMS OTP sent successfully to ${formattedPhone} for ${purpose}`
    );

    return {
      success: true,
      otp,
      expiresAt,
      message: "OTP sent successfully to your phone",
    };
  } catch (error: any) {
    console.error(`Failed to send SMS OTP to ${phoneNumber}:`, error);
    return {
      success: false,
      message: "Failed to send SMS OTP. Please try email verification instead.",
    };
  }
};

/**
 * Resend SMS OTP with rate limiting
 * @param phoneNumber - Recipient phone number
 * @param lastSentTime - When OTP was last sent
 * @param purpose - Purpose of OTP
 * @param cooldownMinutes - Cooldown period in minutes
 * @returns Promise with result
 */
export const resendSMSOTP = async (
  phoneNumber: string,
  lastSentTime: Date,
  purpose:
    | "registration"
    | "login"
    | "password-reset"
    | "verification" = "verification",
  cooldownMinutes: number = 1
): Promise<{
  success: boolean;
  otp?: string;
  expiresAt?: Date;
  message: string;
  canResendAt?: Date;
}> => {
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

    
    return await sendSMSOTP(phoneNumber, purpose);
  } catch (error: any) {
    console.error(`Failed to resend SMS OTP to ${phoneNumber}:`, error);
    return {
      success: false,
      message: "Failed to resend SMS. Please try again.",
    };
  }
};

/**
 * Send property alert SMS
 * @param phoneNumber - Recipient phone number
 * @param propertyTitle - Property title
 * @param price - Property price
 * @param location - Property location
 * @returns Promise with result
 */
export const sendPropertyAlertSMS = async (
  phoneNumber: string,
  propertyTitle: string,
  price: string,
  location: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
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
  } catch (error: any) {
    console.error(
      `Failed to send property alert SMS to ${phoneNumber}:`,
      error
    );
    return {
      success: false,
      message: "Failed to send property alert",
    };
  }
};

/**
 * Send appointment reminder SMS
 * @param phoneNumber - Recipient phone number
 * @param propertyTitle - Property title
 * @param appointmentTime - Appointment date/time
 * @param agentName - Agent name
 * @returns Promise with result
 */
export const sendAppointmentReminderSMS = async (
  phoneNumber: string,
  propertyTitle: string,
  appointmentTime: string,
  agentfullName: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
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
  } catch (error: any) {
    console.error(
      `Failed to send appointment reminder SMS to ${phoneNumber}:`,
      error
    );
    return {
      success: false,
      message: "Failed to send appointment reminder",
    };
  }
};
