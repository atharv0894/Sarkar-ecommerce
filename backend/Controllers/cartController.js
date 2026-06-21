import { Cart } from "../Models/cartModel.js";
import { Product } from "../Models/productModel.js";

// ─────────────────────────────────────────────
// GET CART
// ─────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id,
    }).populate({
      path: "items.product",
      select: "title price images stock brand category",
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    return res.status(200).json({
      success: true,
      cart: cart.items,
      totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: cart.items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0,
      ),
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// ADD TO CART
// ─────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { productId, size } = req.body;

    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: "Product ID and size are required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.size === size,
    );

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items in stock`,
        });
      }
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        product: productId,
        size,
        quantity: 1,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// UPDATE CART
// ─────────────────────────────────────────────
export const updateCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.size === size,
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => !(i.product.toString() === productId && i.size === size),
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// REMOVE FROM CART
// ─────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
  try {
    const { productId, size } = req.body;

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.size === size),
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// CLEAR CART
// ─────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
