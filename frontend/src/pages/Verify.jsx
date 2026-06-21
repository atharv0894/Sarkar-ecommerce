import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../lib/axios";
import { useShop } from "../context/ShopContext";

/**
 * Verify.jsx
 *
 * Stripe redirects here after checkout:
 *   /verify?success=true&orderId=<mongoId>    → payment succeeded
 *   /verify?success=false&orderId=<mongoId>   → payment cancelled / failed
 *
 * This page calls the backend to either confirm or delete the order,
 * then redirects the user to /orders or /place-order accordingly.
 *
 * Route to add in App.jsx:
 *   <Route path="/verify" element={<Verify />} />
 */

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useShop();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "failed" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const success = searchParams.get("success");   // "true" or "false"
      const orderId = searchParams.get("orderId");

      if (!orderId) {
        setStatus("error");
        setMessage("Missing order information. Please contact support.");
        return;
      }

      try {
        const { data } = await API.post("/orders/verifyStripe", {
          orderId,
          success,   // backend checks if this === "true"
        });

        if (data.success) {
          // Payment confirmed — clear cart and redirect to orders
          await clearCart();
          setStatus("success");
          setMessage("Payment confirmed! Redirecting to your orders...");
          setTimeout(() => navigate("/orders", { state: { success: true } }), 2000);
        } else {
          // Payment failed — order was deleted on the backend
          setStatus("failed");
          setMessage("Payment was not completed. Your order has been cancelled.");
          setTimeout(() => navigate("/place-order"), 3000);
        }
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Something went wrong verifying your payment.");
      }
    };

    verify();
  }, []); // run once on mount

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === "verifying" && (
          <>
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Verifying your payment...</h2>
            <p className="text-sm text-gray-500 mt-2">Please don't close this page.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-700">Payment Successful!</h2>
            <p className="text-sm text-gray-500 mt-2">{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-700">Payment Failed</h2>
            <p className="text-sm text-gray-500 mt-2">{message}</p>
            <p className="text-xs text-gray-400 mt-1">Redirecting back to checkout...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-yellow-700">Something went wrong</h2>
            <p className="text-sm text-gray-500 mt-2">{message}</p>
            <button
              onClick={() => navigate("/orders")}
              className="mt-4 px-4 py-2 bg-black text-white text-sm rounded-md hover:bg-gray-800"
            >
              Go to My Orders
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;