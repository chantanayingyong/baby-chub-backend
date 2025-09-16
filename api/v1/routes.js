import express from "express";
import productRoutes from "./routes/productRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
// import testUserRoutes from "./routes/testUserRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import productDetailRoute from "./routes/productDetailRoute.js";

export default () => {
  const router = express.Router();

  router.use("/", productDetailRoute);
  router.use("/auth", authRoutes);
  router.use("/", userRoutes);
  // router.use("/test", testUserRoutes);
  router.use("/", productRoutes); // need to add authAdmin middleware

  router.use("/products/:productId/reviews", reviewRoutes);
  router.use("/", discountRoutes);
  router.use("/", requireAuth, cartRoutes);
  router.use("/", requireAuth, favoriteRoutes);
  router.use("/", requireAuth, orderRoutes);

  return router;
};
