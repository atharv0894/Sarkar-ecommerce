import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String, required: true },  // "S", "M", "L", "XL"
        image: { type: String, required: true },
      },
    ],
    address: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "Stripe", "Razorpay"],
      required: true,
    },
    payment: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Order Placed", "Packing", "Shipped", "Out for Delivery", "Delivered"],
      default: "Order Placed",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);