import express from "express";
import {
  placeOrder,
  allOrders,
  userOrders,
  updateStatus,
} from "../Controllers/orderController.js";
import { isAuthenticated, isAdmin } from "../Middleware/isAuthenticated.js";

const orderRouter = express.Router();

// Place Order
orderRouter.post("/place", isAuthenticated, placeOrder);

// Admin
orderRouter.get("/", isAuthenticated, isAdmin, allOrders);
orderRouter.put("/:orderId/status", isAuthenticated, isAdmin, updateStatus);

// User
orderRouter.get("/userorders", isAuthenticated, userOrders);

export default orderRouter;