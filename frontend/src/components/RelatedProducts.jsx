import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../lib/axios";
import  { formatCurrency }  from "../lib/currency";
const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const RelatedProducts = ({ category, subCategory, currentProductId }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;

    const fetchRelated = async () => {
      try {
        const { data } = await API.get("/products");
        if (data.success) {
          const filtered = data.products
            .filter(
              (p) =>
                String(p._id) !== String(currentProductId) &&
                (p.category === category || p.subCategory === subCategory)
            )
            .slice(0, 5);
          setRelated(filtered);
        }
      } catch (err) {
        console.error("Related products error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [category, subCategory, currentProductId]);

  if (loading || related.length === 0) return null;

  return (
    <>
      <style>{`
        .rp-card {
          text-decoration: none;
          color: inherit;
          display: block;
          cursor: pointer;
        }
        .rp-card:hover .rp-img {
          transform: scale(1.05);
        }
        .rp-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.35s ease;
        }
        .rp-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        @media (max-width: 1024px) { .rp-grid { grid-template-columns: repeat(4, 1fr); } }
        @media (max-width: 768px)  { .rp-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 480px)  { .rp-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 80px", fontFamily: "'Segoe UI', sans-serif" }}>

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
            Related <span style={{ fontWeight: 300, color: "#888" }}>Products</span>
          </h2>
          <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
        </div>

        {/* Grid */}
        <div className="rp-grid">
          {related.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="rp-card"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              {/* Image */}
              <div style={{
                borderRadius: 8,
                overflow: "hidden",
                background: "#f5f5f5",
                aspectRatio: "3/4",
                position: "relative",
              }}>
                <img
                  className="rp-img"
                  src={product.images?.[0]?.url ?? "/placeholder.png"}
                  alt={product.title}
                />
                {product.featured && (
                  <span style={{
                    position: "absolute", top: 8, left: 8,
                    background: "#1a1a1a", color: "#fff",
                    fontSize: 10, fontWeight: 600,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "3px 8px", borderRadius: 20,
                  }}>
                    Featured
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ marginTop: 10 }}>
                <p style={{
                  fontSize: 13, fontWeight: 500, color: "#1a1a1a",
                  margin: "0 0 4px",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {product.title}
                </p>
                <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                  {formatCurrency(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default RelatedProducts;