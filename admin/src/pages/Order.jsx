// src/pages/Order.jsx
import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { listOrders, updateOrderStatus } from "../api";

const STATUS_OPTIONS = ["Order Placed", "Packing", "Shipped", "Out for Delivery", "Delivered"];
const STATUS_COLORS = {
  "Order Placed": "badge-amber",
  "Packing": "badge-blue",
  "Shipped": "badge-blue",
  "Out for Delivery": "badge-amber",
  "Delivered": "badge-green",
  "Cancelled": "badge-red",
};

export default function Order() {
  const { token, toast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await listOrders(token);
      setOrders(data.orders || []);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, token);
      toast(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <p className="page-sub">Manage customer orders</p>
      </div>

      <div className="card table-wrap">
        {orders.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No orders yet</div>
            <div className="empty-sub">Orders will appear here once customers place them</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* ✅ Fixed: use index as fallback key to prevent duplicate key warning */}
                {orders.map((order, index) => (
                  <tr key={order._id || index}>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                      #{String(order._id).slice(-8).toUpperCase()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {order.address?.firstName} {order.address?.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                        {order.address?.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {order.items?.length || 0} item(s)
                      </div>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      ₹{order.amount?.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`badge ${order.payment ? "badge-green" : "badge-amber"}`}>
                        {order.payment ? "Paid" : "Pending"}
                      </span>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td>
                      <select
                        className={`badge ${STATUS_COLORS[order.status] || "badge-gray"}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updating === order._id}
                        style={{
                          padding: "4px 8px",
                          fontSize: 12,
                          fontWeight: 500,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-3)" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 12, padding: "4px 10px" }}
                        onClick={() => {
                          const details = `
Order ID: ${order._id}
Customer: ${order.address?.firstName} ${order.address?.lastName}
Email: ${order.address?.email}
Phone: ${order.address?.phone}
Address: ${order.address?.street}, ${order.address?.city}, ${order.address?.state} - ${order.address?.zipCode}
Items: ${order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
Total: ₹${order.amount}
Payment: ${order.paymentMethod} - ${order.payment ? "Paid" : "Pending"}
Status: ${order.status}
                          `;
                          alert(details);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}