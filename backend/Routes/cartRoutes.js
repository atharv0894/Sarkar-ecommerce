import express from "express";
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../Controllers/cartController.js";
import { isAuthenticated } from "../Middleware/isAuthenticated.js";

const cartRouter = express.Router();

// All cart routes require authentication
cartRouter.get("/", isAuthenticated, getCart);
cartRouter.post("/add", isAuthenticated, addToCart);
cartRouter.put("/update", isAuthenticated, updateCart);
cartRouter.delete("/remove", isAuthenticated, removeFromCart);
cartRouter.delete("/clear", isAuthenticated, clearCart);

export default cartRouter;