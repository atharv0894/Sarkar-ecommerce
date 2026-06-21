// src/api/index.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

const handleRes = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

// ─── AUTH ──────────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  fetch(`${BASE_URL}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(handleRes);

// ─── PRODUCTS ──────────────────────────────────────────────
export const addProduct = (formData, token) =>
  fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: authHeader(token),
    body: formData,
  }).then(handleRes);

export const listProducts = (token) =>
  fetch(`${BASE_URL}/api/products`, {
    headers: authHeader(token),
  }).then(handleRes);

export const getProduct = (id, token) =>
  fetch(`${BASE_URL}/api/products/${id}`, {
    headers: authHeader(token),
  }).then(handleRes);

export const updateProduct = (id, formData, token) =>
  fetch(`${BASE_URL}/api/products/${id}`, {
    method: "PUT",
    headers: authHeader(token),
    body: formData,
  }).then(handleRes);

export const removeProduct = (id, token) =>
  fetch(`${BASE_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  }).then(handleRes);

// ─── ORDERS ────────────────────────────────────────────────
export const listOrders = (token) =>
  fetch(`${BASE_URL}/api/orders`, {
    headers: authHeader(token),
  }).then(handleRes);

export const updateOrderStatus = (orderId, status, token) =>
  fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify({ status }),
  }).then(handleRes);

export const updatePaymentStatus = (orderId, payment, token) =>
  fetch(`${BASE_URL}/api/orders/${orderId}/payment`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify({ payment }),
  }).then(handleRes);

// ─── DASHBOARD STATS ───────────────────────────────────────
export const getDashboardStats = async (token) => {
  const [ordersData, productsData] = await Promise.all([
    listOrders(token).catch(() => ({ orders: [] })),
    listProducts(token),
  ]);

  const orders = ordersData.orders || [];
  const products = productsData.products || [];

  const revenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + (o.amount || 0), 0); // ✅ was totalAmount

  const pending = orders.filter(
    (o) => !["Delivered", "Cancelled"].includes(o.status)
  ).length;

  return { orders, products, revenue, pending };
};