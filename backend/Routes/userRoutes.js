// Routes/userRoutes.js
import express from "express";
import {
  register,
  verifyAccount,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  editAddress,
  setDefaultAddress,
  deleteAddress,
} from "../Controllers/userController.js";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";

const userRouter = express.Router();

userRouter.use((req, res, next) => {
  console.log("userRouter hit:", req.method, req.path);
  next();
});

// ── Auth ────────────────────────────────────────────────────
userRouter.post("/register", register);
userRouter.get("/verify/:token", verifyAccount);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);

// ── Profile (protected) ─────────────────────────────────────
userRouter.get("/profile", isAuthenticated, getProfile);
userRouter.put("/update-profile", isAuthenticated, updateProfile);
userRouter.put("/change-password", isAuthenticated, changePassword);

// ── Addresses (protected) ───────────────────────────────────
userRouter.get("/addresses", isAuthenticated, getAddresses);
userRouter.post("/addresses", isAuthenticated, addAddress);
userRouter.put("/addresses/:id", isAuthenticated, editAddress);
userRouter.patch("/addresses/:id/default", isAuthenticated, setDefaultAddress);
userRouter.delete("/addresses/:id", isAuthenticated, deleteAddress);

export default userRouter;