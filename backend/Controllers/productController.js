import { Product } from "../Models/productModel.js";
import cloudinary from "../Util/cloudinary.js";
import { getDataUri } from "../Util/dataURI.js";

// ─── Create Product ─────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, subCategory, brand, stock, featured } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    if (stock < 0) {
      return res.status(400).json({ success: false, message: "Stock cannot be negative" });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (!file.mimetype.startsWith("image/")) {
          return res.status(400).json({ success: false, message: "Only image files are allowed" });
        }
        const fileUri = getDataUri(file);
        const result = await cloudinary.uploader.upload(fileUri.content, { folder: "products" });
        images.push({ public_id: result.public_id, url: result.secure_url });
      }
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      subCategory,
      brand,
      stock,
      featured,
      images,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Products ───────────────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Product ─────────────────────────────────────
export const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Product ─────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { title, description, price, category, subCategory, brand, stock, featured } = req.body;

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (brand !== undefined) product.brand = brand;
    if (featured !== undefined) product.featured = featured;

    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({ success: false, message: "Stock cannot be negative" });
      }
      product.stock = stock;
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (!file.mimetype.startsWith("image/")) {
          return res.status(400).json({ success: false, message: "Only image files are allowed" });
        }
        const fileUri = getDataUri(file);
        const result = await cloudinary.uploader.upload(fileUri.content, { folder: "products" });
        product.images.push({ public_id: result.public_id, url: result.secure_url });
      }
    }

    await product.save();
    return res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Product ─────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    await Product.findByIdAndDelete(productId);
    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};