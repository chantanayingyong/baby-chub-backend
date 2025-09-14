import express from "express";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productsController.js";
import { requireAdmin, requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("Hello");
});

router.get("/products", getProducts);
router.post("/products", requireAuth, requireAdmin, addProduct);
router.put("/products/:productId", requireAuth, requireAdmin, updateProduct);
router.delete("/products/:productId", requireAuth, requireAdmin, deleteProduct);

export default router;
