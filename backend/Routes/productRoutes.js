import express from "express";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "../Controllers/productController.js";
import { isAuthenticated, isAdmin } from "../Middleware/isAuthenticated.js";
import { upload } from "../Middleware/multer.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, upload.array("images"), createProduct);
router.get("/", getAllProducts);
router.get("/:productId", getSingleProduct);
router.put("/:productId", isAuthenticated, isAdmin, upload.array("images"), updateProduct);
router.delete("/:productId", isAuthenticated, isAdmin, deleteProduct);

export default router;