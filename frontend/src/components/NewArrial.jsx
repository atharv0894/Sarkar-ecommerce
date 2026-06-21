import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currency";
import API from "@/lib/axios";  // ✅ Fixed: was hardcoded localhost:8000

const tagStyles = {
  New: "bg-black text-white",
  Trending: "bg-[#c8a96e] text-white",
  Bestseller: "bg-[#2c2c2a] text-white",
};

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-[#f0ede8] aspect-[3/4]">
        {/* Tag */}
        {product.tag && (
          <span
            className={`absolute top-3 left-3 z-10 text-[10px] font-semibold tracking-widest uppercase px-2 py-1 ${tagStyles[product.tag] || "bg-gray-200 text-gray-700"}`}
          >
            {product.tag}
          </span>
        )}

        {/* Image */}
        <img
          src={product.images?.[0]?.url}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
        />

        {/* Quick Add Overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-3 text-center text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          + Quick Add
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 px-1">
        <p className="text-[10px] tracking-widest uppercase text-[#888780] mb-1">
          {product.category}
        </p>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#2c2c2a] group-hover:underline underline-offset-2 transition-all truncate max-w-[60%]">
            {product.title}
          </h3>
          <p className="text-sm font-semibold text-[#2c2c2a]">
            {formatCurrency(product.price)}
          </p>
        </div>
      </div>
    </div>
  );
}

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");  // ✅ Fixed: uses axios instance
        if (data.success) {
          const tagged = data.products.slice(0, 8).map((p, i) => ({
            ...p,
            tag: p.featured ? "Bestseller" : i < 4 ? "New" : "Trending",
          }));
          setProducts(tagged);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#faf9f6] px-4 sm:px-12 md:px-16 py-12 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#e8e5df] aspect-[3/4] w-full" />
              <div className="mt-3 h-3 bg-[#e8e5df] rounded w-1/3" />
              <div className="mt-2 h-4 bg-[#e8e5df] rounded w-2/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#faf9f6] px-6 sm:px-12 md:px-16 py-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#888780] mb-2">
            — Just Dropped
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#2c2c2a]">
            New Arrivals
          </h2>
        </div>
        <Link
          to="/collection"
          className="self-start sm:self-auto flex items-center gap-2 text-sm font-medium text-[#2c2c2a] border-b border-[#2c2c2a] pb-0.5 hover:text-[#888780] hover:border-[#888780] transition-colors duration-200 group"
        >
          View All
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {products.map((p) => (
          <Link key={p._id} to={`/product/${p._id}`}>
            <ProductCard product={p} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default NewArrivals;