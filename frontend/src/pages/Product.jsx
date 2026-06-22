import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../lib/axios";
import { useShop } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const SIZES = ["S", "M", "L", "XL", "XXL"];

function Product() {
  const { productId } = useParams();
  const { addToCart } = useShop();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${productId}`);
        if (res.data.success) setProduct(res.data.product);
      } catch (err) {
        console.error(err);
        setError("Failed to load product. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    setSelectedSize(null);
    setSelectedImage(0);
  }, [productId]);

  const handleAddToCart = () => {
    if (!selectedSize || !product) return;
    addToCart(product._id, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 32, height: 32, border: "2px solid #eee", borderTop: "2px solid #555", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );

  if (error)
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <p style={{ color: "#e74c3c", fontSize: 14 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ fontSize: 13, padding: "8px 20px", border: "1px solid #ccc", borderRadius: 4, cursor: "pointer", background: "#fff" }}>Retry</button>
      </div>
    );

  if (!product)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "#888", fontSize: 14 }}>Product not found.</p>
      </div>
    );

  const images = product.images?.length ? product.images : [{ url: "/placeholder.png" }];
  const inStock = product.stock > 0;
  const reviewCount = 122;

  return (
    <>
      <style>{`
        .pp * { box-sizing: border-box; }

        .pp-thumb-item {
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .pp-thumb-item:hover { border-color: #bbb; }
        .pp-thumb-item.active { border-color: #1a1a1a; }

        .pp-size-btn {
          padding: 8px 20px;
          border: 1px solid #ccc;
          background: #fff;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .pp-size-btn:hover { border-color: #1a1a1a; }
        .pp-size-btn.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .pp-size-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .pp-add-btn {
          width: 100%;
          padding: 14px 36px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
        }
        .pp-add-btn:hover:not(:disabled) { background: #333; }
        .pp-add-btn:disabled { background: #aaa; cursor: not-allowed; }
        .pp-add-btn.done { background: #27ae60; }

        .pp-tab-btn {
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          color: #888;
          transition: color 0.2s, border-color 0.2s;
        }
        .pp-tab-btn.active { color: #1a1a1a; border-bottom-color: #1a1a1a; }

        /* ── Desktop: thumbs on left (vertical), main image beside ── */
        .pp-image-section {
          display: flex;
          flex-direction: row;
          gap: 14px;
          width: 55%;
          flex-shrink: 0;
        }
        .pp-thumbs {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 88px;
          flex-shrink: 0;
        }
        .pp-thumb-item {
          width: 100%;
          aspect-ratio: 1;
        }
        .pp-layout {
          display: flex;
          flex-direction: row;
          gap: 40px;
          align-items: flex-start;
        }

        /* ── Mobile: full-width main image, horizontal thumbs below ── */
        @media (max-width: 768px) {
          .pp-layout {
            flex-direction: column !important;
          }
          .pp-image-section {
            width: 100% !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .pp-thumbs {
            flex-direction: row !important;
            width: 100% !important;
            overflow-x: auto;
          }
          .pp-thumb-item {
            width: 64px !important;
            height: 64px !important;
            aspect-ratio: 1;
          }
          .pp-main-image {
            width: 100% !important;
            min-height: 360px !important;
          }
        }
      `}</style>

      <div
        className="pp"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 80px", fontFamily: "'Segoe UI', sans-serif" }}
      >
        {/* ── Top section ── */}
        <div className="pp-layout">

          {/* Left: main image + thumbnails */}
          <div className="pp-image-section">

            {/* Main image — on mobile this comes first */}
            <div
              className="pp-main-image"
              style={{ flex: 1, borderRadius: 8, overflow: "hidden", background: "#f5f5f5", position: "relative", order: 1 }}
            >
              <img
                src={images[selectedImage]?.url ?? "/placeholder.png"}
                alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 480 }}
              />
              {!inStock && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, color: "#555", fontWeight: 500 }}>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip — on desktop: left column (order 0); on mobile: below main image (order 2) */}
            <div className="pp-thumbs" style={{ order: 0 }}>
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`pp-thumb-item${selectedImage === i ? " active" : ""}`}
                  onClick={() => setSelectedImage(i)}
                  style={{ width: "100%", aspectRatio: "1" }}
                >
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>

          </div>

          {/* Right: product details */}
          <div style={{ flex: 1, paddingTop: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 600, color: "#1a1a1a", margin: "0 0 10px", lineHeight: 1.3 }}>
              {product.title}
            </h1>

            {/* Stars */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width="15" height="15" viewBox="0 0 24 24"
                  fill={s <= Math.round(product.ratings ?? 4) ? "#f5a623" : "none"}
                  stroke="#f5a623" strokeWidth="1.5">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              ))}
              <span style={{ fontSize: 13, color: "#888" }}>({reviewCount})</span>
            </div>

            {/* Price */}
            <p style={{ fontSize: 28, fontWeight: 600, color: "#1a1a1a", margin: "0 0 16px" }}>
              {formatPrice(product.price)}
            </p>

            {/* Description */}
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 20px" }}>
              {product.description}
            </p>

            <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "0 0 20px" }} />

            {/* Size selector */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Select Size
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SIZES.map((s) => (
                  <button
                    key={s}
                    className={`pp-size-btn${selectedSize === s ? " active" : ""}`}
                    onClick={() => setSelectedSize(s)}
                    disabled={!inStock}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {!selectedSize && inStock && (
                <p style={{ fontSize: 12, color: "#e74c3c", marginTop: 8 }}>Please select a size</p>
              )}
            </div>

            {/* Add to cart */}
            <button
              className={`pp-add-btn${added ? " done" : ""}`}
              onClick={handleAddToCart}
              disabled={!inStock || !selectedSize}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>

            <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "24px 0" }} />

            {/* Trust badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                "✓  100% Original product.",
                "✓  Cash on delivery available on this product.",
                "✓  Easy return and exchange policy within 7 days.",
              ].map((line) => (
                <p key={line} style={{ fontSize: 13, color: "#666", margin: 0 }}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        {/* ── Description / Reviews tabs ── */}
        <div style={{ marginTop: 56 }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", marginBottom: 24 }}>
            <button className={`pp-tab-btn${activeTab === "description" ? " active" : ""}`} onClick={() => setActiveTab("description")}>
              Description
            </button>
            <button className={`pp-tab-btn${activeTab === "reviews" ? " active" : ""}`} onClick={() => setActiveTab("reviews")}>
              Reviews ({reviewCount})
            </button>
          </div>

          {activeTab === "description" ? (
            <div style={{ maxWidth: 720 }}>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, margin: 0 }}>{product.description}</p>
              {product.subCategory && (
                <p style={{ fontSize: 13, color: "#888", marginTop: 12 }}>
                  Type: <strong style={{ color: "#555" }}>{product.subCategory}</strong>
                </p>
              )}
              {product.brand && (
                <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
                  Brand: <strong style={{ color: "#555" }}>{product.brand}</strong>
                </p>
              )}
              <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
                Stock: <strong style={{ color: "#555" }}>{product.stock} units</strong>
              </p>
            </div>
          ) : (
            <div style={{ maxWidth: 720 }}>
              <p style={{ fontSize: 14, color: "#aaa", fontStyle: "italic" }}>
                No reviews yet. Be the first to review this product.
              </p>
            </div>
          )}
        </div>
      </div>

      <RelatedProducts
        category={product.category}
        subCategory={product.subCategory}
        currentProductId={product._id}
      />
    </>
  );
}

export default Product;
