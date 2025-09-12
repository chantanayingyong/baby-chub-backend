import express from "express";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

export default () => {
  const router = express.Router();

  router.use("/", productRoutes);
  router.use("/products/:id/reviews", reviewRoutes);

  return router;
};
