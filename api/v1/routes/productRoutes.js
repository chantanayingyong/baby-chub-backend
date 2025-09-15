import express from "express";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productsController.js";
import reviewRoutes from "./reviewRoutes.js";
import { getNewArrivals } from "../controllers/productsController.js";
import { requireAdmin, requireAuth } from "../../../middleware/auth.js";


const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("Hello");
});

router.get("/products", getProducts);
router.get("/products/new", getNewArrivals);
router.use("/:id/reviews", reviewRoutes);
router.post("/products", requireAuth, requireAdmin, addProduct);
router.put("/products/:productId", requireAuth, requireAdmin, updateProduct);
router.delete("/products/:productId", requireAuth, requireAdmin, deleteProduct);


export default router;
