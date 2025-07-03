import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../common/interfaces/user/index";
import { Role } from "@/common/enums";

const userSchema: Schema<IUser> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
        "Please fill a valid email address",
      ],
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please fill a valid phone number"],
    },
    role: { type: String, enum: Object.values(Role), default: Role.CLIENT },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters long"],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&,.]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ],
    },
    tempOTP: { type: String, select: false },
    tempOTPExpiry: { type: Date, select: false },
    passwordResetRequested: { type: Boolean, default: false },
    otpVerified: { type: Boolean, default: false },
    lastPasswordChange: { type: Date },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      sparse: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);




export default mongoose.model<IUser>("User", userSchema);
