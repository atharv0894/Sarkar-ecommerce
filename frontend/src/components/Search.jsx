import React, { useEffect, useState } from "react";          // ✅ useState imported
import { useShop } from "../context/ShopContext";
import { useLocation, useNavigate } from "react-router-dom";

const Search = () => {
  const { search, setSearch, showSearch, setShowSearch } = useShop();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  // ✅ ALL hooks before any conditional return
  useEffect(() => {
    if (location.pathname.includes("collection") && showSearch) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location, showSearch]);

  // ✅ conditional return AFTER all hooks
  if (!showSearch || !visible) return null;

  const handleSearch = (e) => {
    setSearch(e.target.value);
    navigate(`/collection?search=${e.target.value}`);
  };

  const handleClose = () => {
    setShowSearch(false);
    setSearch("");
  };

  return (
    <div className="flex items-center justify-center gap-3 px-6 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center border border-gray-300 rounded-full px-4 py-1.5 w-full max-w-md">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search products..."
          autoFocus
          className="flex-1 text-sm outline-none bg-transparent"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-gray-400 hover:text-black text-lg leading-none">
            ✕
          </button>
        )}
      </div>
      <button onClick={handleClose} className="text-sm text-gray-500 hover:text-black underline">
        Cancel
      </button>
    </div>
  );
};

export default Search;