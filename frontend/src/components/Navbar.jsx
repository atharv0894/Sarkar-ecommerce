import React, { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, LogOut, User, Package } from "lucide-react";
import logo from "../assets/logos/logo.png";
import profile_icon from "../assets/icons/profile_icon.png";
import search from "../assets/icons/search.png";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useShop } from "../context/ShopContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setShowSearch, getCartCount } = useShop();
  const cartCount = getCartCount();
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location]);

  const navLinkStyles = ({ isActive }) =>
    `pb-1 transition-colors duration-200 ${
      isActive ? "border-b-2 border-black text-black" : "hover:text-black"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    navigate("/login");
  };

  const handleSearchClick = () => {
    navigate("/collection");
    setShowSearch(true);
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b border-gray-200 shadow-sm bg-white">
      <Link to="/">
        <img src={logo} alt="logo" className="w-32 md:w-40" />
      </Link>

      {/* ✅ Fixed: added About to desktop nav (was only in mobile menu) */}
      <ul className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
        <li><NavLink to="/" end className={navLinkStyles}>Home</NavLink></li>
        <li><NavLink to="/collection" className={navLinkStyles}>Collection</NavLink></li>
        <li><NavLink to="/about" className={navLinkStyles}>About</NavLink></li>
        <li><NavLink to="/contact" className={navLinkStyles}>Contact</NavLink></li>
      </ul>

      <div className="flex items-center gap-4 md:gap-6">
        <img
          src={search}
          alt="search"
          className="w-5 cursor-pointer"
          onClick={handleSearchClick}
        />

        <div className="group relative">
          <img src={profile_icon} alt="profile" className="w-5 cursor-pointer" />
          <div className="invisible group-hover:visible absolute right-0 pt-4 z-10">
            <div className="flex flex-col gap-2 w-40 py-3 px-5 bg-slate-800 text-white rounded-md shadow-lg text-sm">
              {token ? (
                <>
                  <p className="text-xs text-gray-400 border-b border-gray-600 pb-2">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <Link to="/profile" className="flex items-center gap-2 hover:text-gray-300">
                    <User size={14} /> My Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 hover:text-gray-300">
                    <Package size={14} /> Orders
                  </Link>
                  <hr className="border-gray-600" />
                  <button onClick={handleLogout} className="flex items-center gap-2 hover:text-gray-300 text-left">
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-gray-300">Sign In</Link>
                  <hr className="border-gray-600" />
                  <Link to="/signup" className="hover:text-gray-300">Create Account</Link>
                </>
              )}
            </div>
          </div>
        </div>

        <Link to="/cart" className="relative">
          <ShoppingCart size={22} className="text-gray-700" />
          {cartCount > 0 && (
            <p className="absolute -right-1.5 -bottom-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-black text-white text-[10px]">
              {cartCount}
            </p>
          )}
        </Link>

        <div className="md:hidden cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`absolute top-full left-0 w-full bg-white border-b border-gray-200 flex flex-col gap-4 p-6 transition-all duration-300 md:hidden ${
        menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}>
        <Link to="/" onClick={() => setMenuOpen(false)} className="font-medium">Home</Link>
        <Link to="/collection" onClick={() => setMenuOpen(false)} className="font-medium">Collection</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)} className="font-medium">About</Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)} className="font-medium">Contact</Link>
        <hr className="border-gray-200" />
        {token ? (
          <>
            <span className="text-sm text-gray-500">{user?.firstName} {user?.lastName}</span>
            <Link to="/profile" onClick={() => setMenuOpen(false)} className="font-medium">My Profile</Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)} className="font-medium">Orders</Link>
            <button onClick={handleLogout} className="text-left font-medium text-red-600">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)} className="font-medium">Sign In</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="font-medium">Create Account</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;