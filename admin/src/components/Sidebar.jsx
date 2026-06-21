// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  {
    to: "/",
    label: "Dashboard",
    end: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    to: "/add",
    label: "Add product",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    to: "/list",
    label: "Products",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    to: "/orders",
    label: "Orders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside style={{
      width: 210,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      padding: "20px 0",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}>
      <div style={{
        padding: "0 16px 12px",
        fontSize: 10,
        fontWeight: 700,
        color: "var(--text-3)",
        textTransform: "uppercase",
        letterSpacing: ".1em",
      }}>
        Navigation
      </div>

      {links.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={({ isActive }) => ({
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 16px",
            margin: "0 8px",
            borderRadius: "var(--radius)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "var(--text-1)" : "var(--text-2)",
            background: isActive ? "var(--bg)" : "transparent",
            transition: "all .15s",
          })}
        >
          {icon}
          {label}
        </NavLink>
      ))}
    </aside>
  );
}