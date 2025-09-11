import express from "express";
import productRoutes from "./routes/productRoutes.js"
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

export default () => {
  const router = express.Router();

  router.use("/", productRoutes);
  router.use("/auth", authRoutes);
  router.use("/", userRoutes);

  return router;
};
