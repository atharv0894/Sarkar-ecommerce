import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../lib/axios";
import { formatCurrency } from "../lib/currency";

const STATUS_STEPS = ["Order Placed", "Packing", "Shipped", "Out for Delivery", "Delivered"];

// Orders that can still be cancelled (before shipping)
const CANCELLABLE_STATUSES = ["Order Placed", "Packing"];

const statusColor = (status) => {
  const map = {
    "Order Placed": "bg-blue-100 text-blue-700",
    Packing: "bg-yellow-100 text-yellow-700",
    Shipped: "bg-purple-100 text-purple-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };
  return map[status] || "bg-gray-100 text-gray-700";
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null); // orderId being cancelled
  const location = useLocation();
  const justOrdered = location.state?.success;

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders/userorders");
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderId);
    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status: "Cancelled" });
      if (data.success) {
        // Optimistically update local state
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: "Cancelled" } : o))
        );
      } else {
        alert(data.message || "Failed to cancel order.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">My Orders</h1>

      {justOrdered && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          🎉 Your order has been placed successfully!
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500 mt-8">No orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIndex = STATUS_STEPS.indexOf(order.status);
            const canCancel = CANCELLABLE_STATUSES.includes(order.status);

            return (
              <div key={order._id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="text-sm font-mono font-medium">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-sm font-semibold">{formatCurrency(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payment</p>
                    <p className="text-sm capitalize">{order.paymentMethod}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        disabled={cancelling === order._id}
                        className="text-xs px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {cancelling === order._id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name || "Product"}</p>
                        <p className="text-xs text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold flex-shrink-0">
                        {formatCurrency((item.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Progress tracker */}
                {order.status !== "Cancelled" && (
                  <div className="px-4 py-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      {STATUS_STEPS.map((step, i) => (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                                i <= stepIndex ? "bg-black border-black" : "bg-white border-gray-300"
                              }`}
                            />
                            <span className="text-xs text-center text-gray-500 hidden sm:block w-16 leading-tight">
                              {step}
                            </span>
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex ? "bg-black" : "bg-gray-200"}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancelled notice */}
                {order.status === "Cancelled" && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-red-50 text-red-600 text-xs">
                    This order was cancelled.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;