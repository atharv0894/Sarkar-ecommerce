// src/App.jsx
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Add from "./pages/Add";
import ProductList from "./pages/ProductList";
import Order from "./pages/Order";

export default function App() {
  const { token, toasts } = useApp();

  if (!token) return <Login />;

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<Add />} />
            <Route path="/edit/:id" element={<Add editMode />} />
            <Route path="/list" element={<ProductList />} />
            <Route path="/orders" element={<Order />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <Toast toasts={toasts} />
    </div>
  );
}