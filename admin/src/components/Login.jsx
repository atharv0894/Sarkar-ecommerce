// src/components/Login.jsx
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { loginAdmin } from "../api";

export default function Login() {
  const { setToken, toast } = useApp();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      if (data.success && data.token) {
        setToken(data.token);
        toast("Welcome back!");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.message || "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)",
    }}>
      <div style={{ width: 380 }}>

        {/* Brand */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            marginBottom: 8,
          }}>
            <span style={{
              background: "var(--accent)", color: "#fff",
              padding: "4px 12px", borderRadius: 8,
              fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px",
            }}>Sarkar</span>
            <span style={{ fontWeight: 500, fontSize: 16, color: "var(--text-2)" }}>
              Admin
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Sign in to manage your store
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "32px 28px" }}>
          <form onSubmit={handleSubmit}>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: "var(--radius)",
                background: "var(--red-bg)", color: "var(--red)",
                fontSize: 13, marginBottom: 18, fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="admin@ekart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-dark"
              style={{ width: "100%", justifyContent: "center", padding: "11px 0" }}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</>
              ) : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}