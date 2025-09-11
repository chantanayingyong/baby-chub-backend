import express from "express";
import productRoutes from "./routes/productRoutes.js"
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

export default () => {
  const router = express.Router();

  router.use("/", productRoutes);
<<<<<<< HEAD
=======
  router.use("/auth", authRoutes);
  router.use("/", userRoutes);

>>>>>>> 86690e93ecf22b266acc361f86b96704eef6073f
  return router;
};
