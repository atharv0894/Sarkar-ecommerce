// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./Database/db.js";
import userRouter from "./Routes/userRoutes.js";
import productRouter from "./Routes/productRoutes.js";
import cartRouter from "./Routes/cartRoutes.js";
import contactRouter from "./Routes/contactRoutes.js";
import orderRouter from "./Routes/orderRoutes.js";



// ✅ Add this line

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://sarkar-ecommerce.vercel.app",
    "https://sarkar-ecommerce-4ao3mhngb-atharv-shindes-projects.vercel.app"
  ],
  credentials: true,
}));
app.use(express.json());

connectDB();

app.use("/api/user", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/contact", contactRouter);
app.use("/api/orders", orderRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ THIS WAS MISSING — server never started without it
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});