// src/components/Navbar.jsx
import React from "react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { setToken } = useApp();

  return (
    <nav style={{
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          background: "var(--accent)", color: "#fff",
          padding: "3px 10px", borderRadius: 7,
          fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px",
        }}>Sarkar</span>
        <span style={{
          fontSize: 12, color: "var(--text-3)", fontWeight: 500,
          textTransform: "uppercase", letterSpacing: ".1em",
        }}>Admin Panel</span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          fontSize: 13, color: "var(--text-2)",
          background: "var(--bg)", padding: "5px 12px",
          borderRadius: 99, border: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
          Administrator
        </div>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 13 }}
          onClick={() => setToken("")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}