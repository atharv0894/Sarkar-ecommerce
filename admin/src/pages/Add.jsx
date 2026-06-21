// src/pages/Add.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { addProduct, updateProduct, getProduct } from "../api";

const CATEGORIES = ["Men", "Women", "Kids", "Unisex"];
const BRANDS = ["Nike", "Adidas", "Puma", "Levis", "Zara", "H&M", "Other"];

export default function Add({ editMode = false }) {
  const { token, toast } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // Form state - MATCHING BACKEND SCHEMA
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const fileRef = useRef();

  // Fetch product for edit mode
  useEffect(() => {
    if (editMode && id) {
      setFetching(true);
      getProduct(id, token)
        .then((data) => {
          if (data.success && data.product) {
            const p = data.product;
            setTitle(p.title || "");
            setDescription(p.description || "");
            setPrice(p.price || "");
            setCategory(p.category || "Men");
            setSubCategory(p.subCategory || "");
            setBrand(p.brand || "");
            setStock(p.stock || "");
            setFeatured(p.featured || false);
            if (p.images) {
              setPreviews(p.images.map(img => img.url));
            }
          }
        })
        .catch((err) => toast(err.message, "error"))
        .finally(() => setFetching(false));
    }
  }, [editMode, id, token]);

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 4);
    setImages((prev) => [...prev, ...arr].slice(0, 4));
    setPreviews((prev) => [
      ...prev, 
      ...arr.map((f) => URL.createObjectURL(f))
    ].slice(0, 4));
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editMode && images.length === 0) {
      return toast("Please add at least one product image", "error");
    }
    if (!price || Number(price) <= 0) {
      return toast("Enter a valid price", "error");
    }
    if (stock && Number(stock) < 0) {
      return toast("Stock cannot be negative", "error");
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("price", price);
      fd.append("category", category);
      fd.append("subCategory", subCategory);
      fd.append("brand", brand);
      fd.append("stock", stock || 0);
      fd.append("featured", featured);
      
      // Only append new images
      images.forEach((img) => fd.append("images", img));

      let data;
      if (editMode && id) {
        data = await updateProduct(id, fd, token);
      } else {
        data = await addProduct(fd, token);
      }
      
      if (data.success) {
        toast(editMode ? "Product updated successfully!" : "Product added successfully!");
        navigate("/list");
      } else {
        toast(data.message || "Operation failed", "error");
      }
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page-loader"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{editMode ? "Edit product" : "Add product"}</h1>
        <p className="page-sub">Fill in the details below to {editMode ? "update the" : "list a new"} product</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Product info */}
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Product information</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Product title *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Premium Cotton T-Shirt"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    rows="4"
                    placeholder="Describe the product — material, features, care instructions…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Quantity in stock"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Product images (max 4)</div>
              <div
                className="upload-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
              >
                <div className="upload-icon">📷</div>
                <div className="upload-title">Click or drag images here</div>
                <div className="upload-sub">PNG, JPG · Up to 5 MB each · Max 4 images</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
              {previews.length > 0 && (
                <div className="image-previews">
                  {previews.map((src, i) => (
                    <div key={i} className="image-preview">
                      <img src={src} alt={`Preview ${i + 1}`} />
                      {!editMode || (editMode && i >= (images.length > 0 ? images.length : 0)) ? (
                        <button
                          type="button"
                          className="del-img"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          title="Remove image"
                        >✕</button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Category */}
            <div className="card" style={{ padding: 20 }}>
              <div className="form-section-title">Category *</div>
              <div className="pill-group">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`pill ${category === c ? "active" : ""}`}
                    onClick={() => setCategory(c)}
                  >{c}</button>
                ))}
              </div>
            </div>

            {/* Sub-category & Brand */}
            <div className="card" style={{ padding: 20 }}>
              <div className="form-section-title">Details</div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Sub-category</label>
                <input
                  className="form-input"
                  placeholder="e.g. T-Shirts, Jeans, Jackets..."
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select
                  className="form-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="">Select brand</option>
                  {BRANDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Options */}
            <div className="card" style={{ padding: 20 }}>
              <div className="form-section-title">Options</div>
              <label style={{
                display: "flex", alignItems: "center", gap: 10,
                cursor: "pointer", fontSize: 14,
              }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <span>
                  <strong>Mark as featured</strong>
                  <span style={{ display: "block", fontSize: 12, color: "var(--text-3)" }}>
                    Appears in featured sections
                  </span>
                </span>
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={() => navigate("/list")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-dark"
                style={{ flex: 2, justifyContent: "center" }}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving…</>
                ) : (editMode ? "Update product" : "Add product")}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}