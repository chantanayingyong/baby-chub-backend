import express from "express";
import productRoutes from "./routes/productRoutes.js";
import testUserRoutes from "./routes/testUserRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { authUser } from "../../middleware/auth.js";

export default () => {
  const router = express.Router();

  router.use("/test", testUserRoutes);
  router.use("/", productRoutes);
  router.use("/", authUser, cartRoutes);
  return router;
};