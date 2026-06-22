// Controllers/userController.js

import { User } from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";

import verifyEmail from "../Verify/emailVerify.js";

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });
    if (!validator.isEmail(email))
      return res.status(400).json({ success: false, message: "Invalid email" });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email });
    if (existingUser?.isVerified)
      return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign(
      { firstName, lastName, email, password: hashedPassword },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    await verifyEmail(email, token);
    return res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Verify Account
// ─────────────────────────────────────────────────────────────
export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const existingUser = await User.findOne({ email: decoded.email });

    if (existingUser?.isVerified)
      return res.status(400).json({ success: false, message: "User already verified" });

    let user;
    if (existingUser) {
      existingUser.isVerified = true;
      user = await existingUser.save();
    } else {
      user = await User.create({
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
        password: decoded.password,
        isVerified: true,
      });
    }

    const userData = user.toObject();
    delete userData.password;
    return res.status(200).json({ success: true, message: "Account verified successfully", user: userData });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
};

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    if (!user.isVerified)
      return res.status(401).json({ success: false, message: "Please verify your email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const userData = user.toObject();
    delete userData.password;
    return res.status(200).json({ success: true, message: "Login successful", token, user: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Sarkar", email: process.env.BREVO_EMAIL },
        to: [{ email: user.email }],
        subject: "Password Reset",
        htmlContent: `<h2>Password Reset</h2><p>Click the link below to reset your password:</p><a href="${resetURL}">${resetURL}</a>`,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to send email");
    }

    return res.status(200).json({ success: true, message: "Reset link sent to email" });
  } catch (error) {
    console.error("Mail Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ success: false, message: "Password is required" });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Get Profile  →  GET /api/user/profile
// ─────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const userData = req.user.toObject();
    delete userData.password;
    return res.status(200).json({ success: true, user: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Update Profile  →  PUT /api/user/update-profile
// ─────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, gender, dob } = req.body;

    if (!firstName || !lastName)
      return res.status(400).json({ success: false, message: "First name and last name are required" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone: phone || "", gender: gender || "", dob: dob || null },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Change Password  →  PUT /api/user/change-password
// ─────────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Both current and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Get Addresses  →  GET /api/user/addresses
// ─────────────────────────────────────────────────────────────
export const getAddresses = async (req, res) => {
  try {
    return res.status(200).json({ success: true, addresses: req.user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Add Address  →  POST /api/user/addresses
// ─────────────────────────────────────────────────────────────
export const addAddress = async (req, res) => {
  try {
    const { tag, name, line1, line2, city, state, pincode, phone, isDefault } = req.body;
    if (!name || !line1 || !city || !pincode)
      return res.status(400).json({ success: false, message: "Name, address, city and pincode are required" });

    const user = await User.findById(req.user._id);
    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    const makeDefault = isDefault || user.addresses.length === 0;

    user.addresses.push({
      tag: tag || "Home", name, line1, line2: line2 || "",
      city, state: state || "", pincode, phone: phone || "", isDefault: makeDefault,
    });
    await user.save();
    return res.status(201).json({ success: true, message: "Address added successfully", addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Edit Address  →  PUT /api/user/addresses/:id
// ─────────────────────────────────────────────────────────────
export const editAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { tag, name, line1, line2, city, state, pincode, phone, isDefault } = req.body;
    if (!name || !line1 || !city || !pincode)
      return res.status(400).json({ success: false, message: "Name, address, city and pincode are required" });

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(id);
    if (!address)
      return res.status(404).json({ success: false, message: "Address not found" });

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    address.tag = tag || address.tag;
    address.name = name;
    address.line1 = line1;
    address.line2 = line2 || "";
    address.city = city;
    address.state = state || "";
    address.pincode = pincode;
    address.phone = phone || "";
    address.isDefault = isDefault ?? address.isDefault;

    await user.save();
    return res.status(200).json({ success: true, message: "Address updated successfully", addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Set Default Address  →  PATCH /api/user/addresses/:id/default
// ─────────────────────────────────────────────────────────────
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(id);
    if (!address)
      return res.status(404).json({ success: false, message: "Address not found" });

    user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;
    await user.save();
    return res.status(200).json({ success: true, message: "Default address updated", addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Delete Address  →  DELETE /api/user/addresses/:id
// ─────────────────────────────────────────────────────────────
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(id);
    if (!address)
      return res.status(404).json({ success: false, message: "Address not found" });

    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;
    await user.save();
    return res.status(200).json({ success: true, message: "Address deleted successfully", addresses: user.addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
