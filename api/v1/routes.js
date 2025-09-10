import express from "express";
import productRoutes from "./routes/productRoutes.js";

export default () => {
  const router = express.Router();

  router.use("/", productRoutes);
  return router;
};
