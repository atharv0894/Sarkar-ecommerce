import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../lib/axios";
import { useShop } from "../context/ShopContext";
 import{ formatCurrency } from "@/lib/currency";
// ---------------------------------------------------------------------------
// Category map
// ---------------------------------------------------------------------------
const CATEGORIES = ["Men", "Women", "Kids", "Unisex"];

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------
const ProductCard = ({ product }) => (
  <Link to={`/product/${product._id}`} className="group cursor-pointer block">
    <div className="overflow-hidden rounded-lg bg-gray-100 relative">
      <img
        src={product.images?.[0]?.url}
        alt={product.title}
        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {product.featured && (
        <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
          Featured
        </span>
      )}
    </div>
    <div className="mt-2">
      <p className="text-sm font-medium text-gray-800 truncate">{product.title}</p>
      <p className="text-sm text-gray-500 mt-0.5">{formatCurrency(product.price)}</p>
    </div>
  </Link>
);

// ---------------------------------------------------------------------------
// FilterSection — collapsible
// ---------------------------------------------------------------------------
const FilterSection = ({ title, options, selected, onToggle }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-300 rounded">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-wide"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-3 pt-2 space-y-2 border-t border-gray-100">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="w-4 h-4 accent-black cursor-pointer"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Collection
// ---------------------------------------------------------------------------
const Collection = () => {
  const [searchParams] = useSearchParams();
  const { search, setSearch } = useShop(); // ✅ from context, not local state

  const [products, setProducts]           = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [showFilters, setShowFilters]     = useState(false);
  const [categories, setCategories]       = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [sortType, setSortType]           = useState("relevant");

  // SubCategory options derived from DB products (narrowed by selected categories)
  const availableSubCats = [
    ...new Set(
      products
        .filter((p) => categories.length === 0 || categories.includes(p.category))
        .map((p) => p.subCategory)
        .filter(Boolean)
    ),
  ].sort();

  // -------------------------------------------------------------------------
  // Fetch products
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await API.get("/products");
        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.message || "Failed to load products.");
        }
      } catch (err) {
        setError("Could not reach the server. Please try again.");
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // -------------------------------------------------------------------------
  // Filter + sort
  // -------------------------------------------------------------------------
  useEffect(() => {
    let result = [...products];

    if (search) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categories.length > 0) {
      result = result.filter((p) => categories.includes(p.category));
    }

    if (subCategories.length > 0) {
      result = result.filter((p) => subCategories.includes(p.subCategory));
    }

    switch (sortType) {
      case "low-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "high-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "featured":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        break;
    }

    setFiltered(result);
  }, [products, search, categories, subCategories, sortType]);

  // -------------------------------------------------------------------------
  // Toggle helpers
  // -------------------------------------------------------------------------
  const toggleCategory = (val) => {
    setCategories((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
    setSubCategories([]);
  };

  const toggleSubCategory = (val) => {
    setSubCategories((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const clearFilters = () => {
    setCategories([]);
    setSubCategories([]);
    setSearch("");  // ✅ clears context search
    setSortType("relevant");
  };

  const hasActiveFilters = categories.length > 0 || subCategories.length > 0 || search;

  // -------------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-800" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Error
  // -------------------------------------------------------------------------
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 gap-3">
        <p className="text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm underline hover:text-black"
        >
          Try again
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------
  return (
    <div className="px-4 sm:px-8 py-10">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <h1 className="text-2xl font-medium tracking-wide uppercase">Collection</h1>
        <span className="h-px flex-1 bg-gray-300" />
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* ---------------------------------------------------------------- */}
        {/* Sidebar                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="min-w-[220px]">
          {/* Mobile toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 text-base font-medium uppercase tracking-wide mb-4 sm:mb-0 cursor-pointer"
          >
            Filters
            <svg
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-90" : ""} sm:hidden`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className={`${showFilters ? "block" : "hidden"} sm:block space-y-4 mt-4`}>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 underline hover:text-black"
              >
                Clear all filters
              </button>
            )}

            {/* Category */}
            <FilterSection
              title="Category"
              options={CATEGORIES}
              selected={categories}
              onToggle={toggleCategory}
            />

            {/* SubCategory — only shows types present in DB */}
            {availableSubCats.length > 0 && (
              <FilterSection
                title="Type"
                options={availableSubCats}
                selected={subCategories}
                onToggle={toggleSubCategory}
              />
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Product grid                                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex-1">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-6">
            <p className="text-sm text-gray-500">
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </p>

            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option value="relevant">Sort: Relevant</option>
                <option value="featured">Featured first</option>
                <option value="low-high">Price: Low to high</option>
                <option value="high-low">Price: High to low</option>
              </select>
            </div>
          </div>

          {/* Active filter tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <span className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  "{search}"
                  <button onClick={() => setSearch("")} className="hover:text-black">✕</button>
                </span>
              )}
              {categories.map((c) => (
                <span key={c} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {c}
                  <button onClick={() => toggleCategory(c)} className="hover:text-black">✕</button>
                </span>
              ))}
              {subCategories.map((s) => (
                <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  {s}
                  <button onClick={() => toggleSubCategory(s)} className="hover:text-black">✕</button>
                </span>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <p className="text-sm">No products match your filters.</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-2 text-sm underline hover:text-black">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;