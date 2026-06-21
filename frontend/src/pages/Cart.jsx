import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import{formatCurrency} from "@/lib/currency"

const Cart = () => {
  const {
    products,
    cartItems,
    updateCartQty,
    removeFromCart,
    getCartAmount,
  } = useShop();

  const [cartData, setCartData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!products?.length || !Object.keys(cartItems).length) {
      setCartData([]);
      return;
    }

    const tempData = [];

    for (const [key, qty] of Object.entries(cartItems)) {
      if (qty <= 0) continue;

      const [productId, size] = key.split("_");

      const product = products.find(
        (p) => p._id === productId
      );

      if (product) {
        tempData.push({
          _id: productId,
          title: product.title,
          image: product.images?.[0]?.url,
          price: product.price,
          size,
          quantity: qty,
        });
      }
    }

    setCartData(tempData);
  }, [cartItems, products]);

  return (
      <div className="max-w-4xl mx-auto px-4 py-8 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6">
        Your Cart
      </h1>

      {cartData.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">
            Your cart is empty.
          </p>

          <button
            onClick={() => navigate("/collection")}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
          >
            Shop Now
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartData.map((item) => (
              <div
                key={`${item._id}-${item.size}`}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-md"
                />

                <div className="flex-1">
                  <h3 className="font-medium">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Size: {item.size}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        updateCartQty(
                          item._id,
                          item.size,
                          item.quantity - 1
                        )
                      }
                      className="w-8 h-8 border rounded hover:bg-gray-100"
                    >
                      -
                    </button>

                    <span className="w-8 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateCartQty(
                          item._id,
                          item.size,
                          item.quantity + 1
                        )
                      }
                      className="w-8 h-8 border rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>

                  <button
                    onClick={() =>
                      removeFromCart(
                        item._id,
                        item.size
                      )
                    }
                    className="text-sm text-red-600 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 flex justify-between items-center">
            <p className="text-lg font-semibold">
              Total: {formatCurrency(getCartAmount())}
            </p>  

            <button
              onClick={() =>
                navigate("/place-order")
              }
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;