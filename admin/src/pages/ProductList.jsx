// src/pages/ProductList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { listProducts, removeProduct } from "../api";

const CATEGORIES = ["All", "Men", "Women", "Kids", "Unisex"];

export default function ProductList() {
  const { token, toast } = useApp();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    listProducts(token)
      .then((data) => setProducts(data.products || []))
      .catch((e) => toast(e.message, "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const filtered = useMemo(() => {
    let list = products;
    if (catFilter !== "All") list = list.filter((p) => p.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.title?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, catFilter, search]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await removeProduct(id, token);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast("Product deleted successfully");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <p className="page-sub">{products.length} products in your catalogue</p>
      </div>

      <div className="filter-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-chip ${catFilter === c ? "active" : ""}`}
            onClick={() => setCatFilter(c)}
          >{c}</button>
        ))}
      </div>

      <div className="card table-wrap">
        <div className="table-toolbar">
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-dark" onClick={() => navigate("/add")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add product
          </button>
        </div>

        {loading ? (
          <div className="page-loader">
            <div className="spinner" style={{ width: 24, height: 24 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📦</div>
            <div className="empty-title">
              {search || catFilter !== "All" ? "No matches found" : "No products yet"}
            </div>
            <div className="empty-sub">
              {search ? "Try a different search" : "Add your first product to get started"}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Brand</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      {p.images?.[0] ? (
                        <img className="prod-thumb" src={p.images[0].url} alt={p.title} />
                      ) : (
                        <div className="prod-thumb-placeholder">📦</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {p.subCategory || "No sub-category"}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{p.category}</span>
                    </td>
                    <td style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                      ₹{Number(p.price).toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className={`badge ${
                        p.stock === 0 ? "badge-red" : 
                        p.stock <= 5 ? "badge-amber" : 
                        "badge-green"
                      }`}>
                        {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                      </span>
                    </td>
                    <td>
                      {p.featured ? (
                        <span className="badge badge-amber">⭐ Featured</span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-3)" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-2)" }}>
                      {p.brand || "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          className="btn-icon"
                          title="Edit product"
                          onClick={() => navigate(`/edit/${p._id}`)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete product"
                          disabled={deleting === p._id}
                          onClick={() => handleDelete(p._id, p.title)}
                        >
                          {deleting === p._id ? (
                            <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6"/>
                              <path d="M14 11v6"/>
                              <path d="M9 6V4h6v2"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-3)", textAlign: "right" }}>
          Showing {filtered.length} of {products.length} products
        </p>
      )}
    </div>
  );
}