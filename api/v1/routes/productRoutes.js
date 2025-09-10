import express from "express";
import { addProduct, getProducts } from "../controllers/productsController.js";
import reviewRoutes from "./reviewRoutes.js";

const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("Hello");
});

router.get("/products", getProducts);

router.post("/products", addProduct);

router.use("/:id/reviews", reviewRoutes);

export default router;
