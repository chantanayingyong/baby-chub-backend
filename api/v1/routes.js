import express from "express";
import productRoutes from "./routes/productRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import testUserRoutes from "./routes/testUserRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { authUser } from "../../middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";


export default () => {
  const router = express.Router();

  router.use("/auth", authRoutes);
  router.use("/", userRoutes);
  router.use("/test", testUserRoutes);
  router.use("/", productRoutes);    // need to add authAdmin middleware
  router.use("/", discountRoutes);   // need to add authAdmin middleware
  router.use("/", authUser, cartRoutes);
  router.use("/", authUser, favoriteRoutes);
  router.use("/", authUser, orderRoutes);

  return router;
};
