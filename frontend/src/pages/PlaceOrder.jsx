import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import API from "../lib/axios";
import { formatCurrency } from "../lib/currency";

const DELIVERY_FEE = 5;

const PlaceOrder = () => {
  const { cartItems, products, getCartAmount, clearCart } = useShop();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileRes = await API.get("/user/profile");
        const addressRes = await API.get("/user/addresses");
        const user = profileRes.data.user;
        const defaultAddress =
          addressRes.data.addresses.find((a) => a.isDefault) ||
          addressRes.data.addresses[0];

        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          street: defaultAddress?.line1 || "",
          city: defaultAddress?.city || "",
          state: defaultAddress?.state || "",
          zipCode: defaultAddress?.pincode || "",
          country: "India",
          phone: defaultAddress?.phone || user.phone || "",
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, []);

  const orderItems = Object.entries(cartItems)
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => {
      const [productId, size] = key.split("_");
      const product = products.find((p) => p._id === productId);
      return { productId, size, quantity: qty, product };
    })
    .filter((i) => i.product);

  const subtotal = getCartAmount();
  const total = subtotal + DELIVERY_FEE;

  const validate = () => {
    const newErrors = {};
    ["firstName", "lastName", "email", "street", "city", "state", "zipCode", "country", "phone"].forEach(
      (field) => { if (!form[field].trim()) newErrors[field] = "Required"; }
    );
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (orderItems.length === 0) { alert("Your cart is empty."); return; }

    setLoading(true);
    try {
      const { data } = await API.post("/orders/place", {
        address: form,
        items: orderItems.map(({ productId, size, quantity, product }) => ({
          productId,
          size,
          quantity,
          name: product.title,
          price: product.price,
          image: product.images?.[0]?.url,
        })),
        paymentMethod: "COD",
        amount: total,
      });

      if (data.success) {
        await clearCart();
        navigate("/orders", { state: { success: true } });
      } else {
        alert(data.message || "Failed to place order.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* DELIVERY INFO */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className={inputClass("firstName")} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className={inputClass("lastName")} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
            <div className="col-span-2">
              <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className={inputClass("email")} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div className="col-span-2">
              <input name="street" placeholder="Street Address" value={form.street} onChange={handleChange} className={inputClass("street")} />
              {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
            </div>
            <div>
              <input name="city" placeholder="City" value={form.city} onChange={handleChange} className={inputClass("city")} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <input name="state" placeholder="State" value={form.state} onChange={handleChange} className={inputClass("state")} />
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
            </div>
            <div>
              <input name="zipCode" placeholder="Zip Code" value={form.zipCode} onChange={handleChange} className={inputClass("zipCode")} />
              {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>}
            </div>
            <div>
              <input name="country" placeholder="Country" value={form.country} onChange={handleChange} className={inputClass("country")} />
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
            </div>
            <div className="col-span-2">
              <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={inputClass("phone")} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* PAYMENT */}
          <h2 className="text-lg font-semibold mt-8 mb-4">Payment Method</h2>
          <div className="flex items-center gap-3 p-3 border border-black bg-gray-50 rounded-md">
            <input type="radio" checked readOnly className="accent-black" />
            <span className="text-sm font-medium">Cash on Delivery</span>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {orderItems.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">Your cart is empty.</p>
              ) : (
                orderItems.map(({ productId, size, quantity, product }) => (
                  <div key={`${productId}_${size}`} className="flex items-center gap-3 p-3">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.title}
                      className="w-14 h-14 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.title}</p>
                      <p className="text-xs text-gray-500">Size: {size} · Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-semibold flex-shrink-0">
                      {formatCurrency(product.price * quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-gray-200 p-4 space-y-2 bg-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span>{formatCurrency(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || orderItems.length === 0}
            className="w-full mt-6 bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;