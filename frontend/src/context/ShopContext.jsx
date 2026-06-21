// context/ShopContext.jsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import API from "../lib/axios";


const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  // ─── Search ──────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // ─── Products ────────────────────────────────────────────
  const [products, setProducts] = useState([]);

  // ─── Cart ────────────────────────────────────────────────
  const [cartItems, setCartItems] = useState({});

  const isLoggedIn = () => !!localStorage.getItem("token");

  // ─── Fetch Products ──────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get("/products");

        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  // ─── Fetch Cart ──────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) {
      setCartItems({});
      return;
    }

    try {
      const { data } = await API.get("/cart");

      if (data.success) {
        const map = {};

        for (const item of data.cart) {
          const key = `${item.product._id}_${item.size}`;
          map[key] = item.quantity;
        }

        setCartItems(map);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }, []);

  // ─── Sync Cart On Login/Logout ───────────────────────────
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ─── Add To Cart ─────────────────────────────────────────
  const addToCart = async (productId, size) => {
    if (!isLoggedIn()) {
      alert("Please login to add items to cart");
      return;
    }

    if (!size) {
      alert("Please select a size");
      return;
    }

    try {
      const { data } = await API.post("/cart/add", {
        productId,
        size,
      });

      if (data.success) {
        const key = `${productId}_${size}`;

        setCartItems((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + 1,
        }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add to cart";

      alert(msg);
    }
  };

  // ─── Update Cart Quantity ────────────────────────────────
  const updateCartQty = async (productId, size, quantity) => {
    try {
      const { data } = await API.put("/cart/update", {
        productId,
        size,
        quantity,
      });

      if (data.success) {
        const key = `${productId}_${size}`;

        setCartItems((prev) => {
          const updated = { ...prev };

          if (quantity <= 0) {
            delete updated[key];
          } else {
            updated[key] = quantity;
          }

          return updated;
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update cart");
    }
  };

  // ─── Remove From Cart ────────────────────────────────────
  const removeFromCart = async (productId, size) => {
    try {
      await API.delete("/cart/remove", {
        data: { productId, size },
      });

      const key = `${productId}_${size}`;

      setCartItems((prev) => {
        const updated = { ...prev };

        delete updated[key];

        return updated;
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove item");
    }
  };

  // ─── Clear Cart ──────────────────────────────────────────
  const clearCart = async () => {
    try {
      await API.delete("/cart/clear");

      setCartItems({});
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  // ─── Cart Count ──────────────────────────────────────────
  const getCartCount = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  // ─── Cart Amount ─────────────────────────────────────────
  const getCartAmount = () => {
    let total = 0;

    for (const [key, qty] of Object.entries(cartItems)) {
      const [productId] = key.split("_");

      const product = products.find((p) => p._id === productId);

      if (product) {
        total += product.price * qty;
      }
    }

    return total;
  };

  return (
    <ShopContext.Provider
      value={{
        // products
        products,

        // search
        search,
        setSearch,
        showSearch,
        setShowSearch,

        // cart state
        cartItems,
        setCartItems,

        // cart actions
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        fetchCart,

        // cart computed
        getCartCount,
        getCartAmount,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);

  if (!ctx) {
    throw new Error("useShop must be used inside ShopProvider");
  }

  return ctx;
};
