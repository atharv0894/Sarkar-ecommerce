// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getDashboardStats } from "../api";

const STATUS_BADGE = {
  "Order Placed": "badge-blue",
  Processing:     "badge-amber",
  Shipped:        "badge-blue",
  "Out for Delivery": "badge-amber",
  Delivered:      "badge-green",
  Cancelled:      "badge-red",
};

export default function Dashboard() {
  const { token, toast } = useApp();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats(token)
      .then(setStats)
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="page-loader"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
  );

  const { orders = [], products = [], revenue = 0, pending = 0 } = stats || {};
  const recentOrders = [...orders].reverse().slice(0, 6);
  const lowStock = products.filter((p) => p.stock !== undefined && p.stock <= 5);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Store overview for today</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          label="Total orders"
          value={orders.length}
          delta="All time"
          deltaType="neutral"
          icon={<OrderIcon />}
        />
        <StatCard
          label="Revenue"
          value={`₹${revenue.toLocaleString("en-IN")}`}
          delta="From delivered orders"
          deltaType="neutral"
          icon={<RevenueIcon />}
        />
        <StatCard
          label="Products"
          value={products.length}
          delta={`${lowStock.length} low stock`}
          deltaType={lowStock.length > 0 ? "down" : "neutral"}
          icon={<ProductIcon />}
        />
        <StatCard
          label="Pending"
          value={pending}
          delta="Awaiting fulfilment"
          deltaType={pending > 0 ? "down" : "neutral"}
          icon={<PendingIcon />}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

        {/* Recent orders table */}
        <div className="card table-wrap">
          <div className="table-toolbar">
            <span className="table-toolbar-title">Recent orders</span>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate("/orders")}>
              View all →
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <Empty title="No orders yet" />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Amount</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-2)" }}>
                      #{String(o._id).slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{o.address?.firstName} {o.address?.lastName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{o.address?.city}</div>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      ₹{o.amount?.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[o.status] || "badge-gray"}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Low stock alert */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-toolbar">
            <span className="table-toolbar-title">Low stock</span>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate("/list")}>
              Manage →
            </button>
          </div>
          {lowStock.length === 0 ? (
            <Empty title="All products stocked" sub="No items below 5 units" />
          ) : (
            <div style={{ padding: "8px 0" }}>
              {lowStock.map((p) => (
                <div key={p._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 20px", borderBottom: "1px solid var(--border)",
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>{p.category}</div>
                  </div>
                  <span className={`badge ${p.stock === 0 ? "badge-red" : "badge-amber"}`}>
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, deltaType, icon }) {
  return (
    <div className="card stat-card">
      <div className="stat-label">{icon} {label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-delta ${deltaType}`}>{delta}</div>
    </div>
  );
}

function Empty({ title, sub }) {
  return (
    <div className="empty">
      <div className="empty-title">{title}</div>
      {sub && <div className="empty-sub">{sub}</div>}
    </div>
  );
}

const OrderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
  </svg>
);
const RevenueIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>
);
const ProductIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
  </svg>
);
const PendingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);