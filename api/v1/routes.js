import express from "express";
import productRoutes from "./routes/productRoutes.js"
import authRoutes from "./routes/authRoutes.js";   // authRoutes ไม่มี prefix
import userRoutes from "./routes/userRoutes.js";   // มี /users ในไฟล์แล้ว

export default () => {
  const router = express.Router();

  router.use("/", productRoutes);
  router.use("/auth", authRoutes);
  router.use("/", userRoutes);

  return router;
};