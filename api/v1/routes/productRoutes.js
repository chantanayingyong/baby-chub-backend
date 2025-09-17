import express from "express";
import { addProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productsController.js";
import reviewRoutes from "./reviewRoutes.js";
import { getNewArrivals } from "../controllers/productsController.js";
import { requireAdmin, requireAuth } from "../../../middleware/auth.js";
import uploadImages from "../../../middleware/multer.js";
import { optionalAuth } from "../../../middleware/optionalAuth.js";


const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("Hello");
});

router.get("/products", optionalAuth, getProducts);
router.get("/new-products", getNewArrivals);
router.use("/:id/reviews", reviewRoutes);
router.post("/products", requireAuth, requireAdmin, uploadImages, addProduct);
router.put("/products/:productId", requireAuth, requireAdmin, uploadImages, updateProduct);
router.delete("/products/:productId", requireAuth, requireAdmin, deleteProduct);


export default router;
