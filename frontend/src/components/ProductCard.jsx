import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { formatCurrency } from "../lib/currency";

const tagStyles = {
  New: "bg-black text-white",
  Trending: "bg-[#c8a96e] text-white",
  Bestseller: "bg-[#2c2c2a] text-white",
};

function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useShop();

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product._id, "M");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="block">
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
          <button
            onClick={handleQuickAdd}
            className={`absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm py-3 text-center text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
              hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            + Quick Add
          </button>
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
    </Link>
  );
}

export default ProductCard;