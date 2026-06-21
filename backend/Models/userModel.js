// Models/userModel.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    tag: { type: String, default: "Home" },
    name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    pincode: { type: String, required: true },
    phone: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    phone: { type: String, default: "" },
    dob: { type: Date, default: null },
    gender: { type: String, default: "" },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    addresses: { type: [addressSchema], default: [] },

    // Password reset fields
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);