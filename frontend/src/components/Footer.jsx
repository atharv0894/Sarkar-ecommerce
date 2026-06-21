import React, { useState } from "react";


import { Link } from "react-router-dom";

function Footer() {
  const [email, setEmail] = useState("");






  return (
    <footer className="bg-[#faf9f6] text-[#2c2c2a] border-t border-[#e5e2dc]">



      {/* ─── Main Footer ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">

          <Link to="/">
            <h1 className="text-2xl font-black tracking-tighter">
              SARKAR.
            </h1>
          </Link>

          <p className="text-[#888780] text-xs mt-3 leading-relaxed max-w-[220px]">
            Premium streetwear.
            Designed for those who move
            different.
          </p>
        </div>

        {/* Shop */}
        <div>

          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#888780] mb-4">
            Shop
          </h4>

          <ul className="space-y-2 text-sm text-[#5f5d57]">

            <li>
              <Link
                to="/collection"
                className="hover:text-[#c8a96e] transition"
              >
                All Products
              </Link>
            </li>

            <li>
              <Link
                to="/collection"
                className="hover:text-[#c8a96e] transition"
              >
                New Arrivals
              </Link>
            </li>

            <li>
              <Link
                to="/collection"
                className="hover:text-[#c8a96e] transition"
              >
                Best Sellers
              </Link>
            </li>

            <li>
              <Link
                to="/cart"
                className="hover:text-[#c8a96e] transition"
              >
                Cart
              </Link>
            </li>

          </ul>
        </div>

        {/* Company */}
        <div>

          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#888780] mb-4">
            Company
          </h4>

          <ul className="space-y-2 text-sm text-[#5f5d57]">

            <li>
              <Link
                to="/profile"
                className="hover:text-[#c8a96e] transition"
              >
                My Profile
              </Link>
            </li>

            <li>
              <Link
                to="/orders"
                className="hover:text-[#c8a96e] transition"
              >
                Orders
              </Link>
            </li>

            <li>
              <Link
                to="/cart"
                className="hover:text-[#c8a96e] transition"
              >
                Cart
              </Link>
            </li>

            <li>
              <Link
                to="/collection"
                className="hover:text-[#c8a96e] transition"
              >
                Explore
              </Link>
            </li>

          </ul>
        </div>

        {/* Support */}
        <div>

          <h4 className="text-xs font-semibold uppercase tracking-widest text-[#888780] mb-4">
            Support
          </h4>

          <ul className="space-y-2 text-sm text-[#5f5d57]">

            <li>
              <Link
                to="/profile"
                className="hover:text-[#c8a96e] transition"
              >
                My Account
              </Link>
            </li>

            <li>
              <Link
                to="/orders"
                className="hover:text-[#c8a96e] transition"
              >
                Track Orders
              </Link>
            </li>

            <li>
              <Link
                to="/cart"
                className="hover:text-[#c8a96e] transition"
              >
                Shopping Cart
              </Link>
            </li>

            <li>
              <Link
                to="/collection"
                className="hover:text-[#c8a96e] transition"
              >
                Shop Now
              </Link>
            </li>

          </ul>
        </div>
      </div>

      {/* ─── Bottom Bar ─────────────────────── */}
      <div className="border-t border-[#e5e2dc]">

        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">

          <p className="text-[#888780] text-xs">
            © 2026 SARKAR.
            All rights reserved.
          </p>

          <div className="flex gap-4 text-xs text-[#888780]">

            <Link
              to="/collection"
              className="hover:text-[#c8a96e] transition"
            >
              Shop
            </Link>

            <Link
              to="/orders"
              className="hover:text-[#c8a96e] transition"
            >
              Orders
            </Link>

            <Link
              to="/profile"
              className="hover:text-[#c8a96e] transition"
            >
              Profile
            </Link>

          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;