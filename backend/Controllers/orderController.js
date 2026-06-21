import mongoose from "mongoose";
import { Order } from "../Models/orderModel.js";

// ─────────────────────────────────────────────
// Place Order — COD
// ─────────────────────────────────────────────
export const placeOrder = async (req, res) => {
  try {
    const { items, address, amount } = req.body;

    const order = await Order.create({
      userId: req.user._id,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      status: "Order Placed",
    });

    return res.status(201).json({ success: true, message: "Order Placed", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// All Orders — Admin Panel
// ─────────────────────────────────────────────
export const allOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// User Orders — Frontend
// ─────────────────────────────────────────────
export const userOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// Update Order Status — Admin Panel
// ─────────────────────────────────────────────
export const updateStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    await Order.findByIdAndUpdate(orderId, { status });
    return res.status(200).json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};