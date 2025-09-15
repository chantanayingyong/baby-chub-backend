import express from "express";
<<<<<<< HEAD
import { addProduct, getProducts } from "../controllers/productsController.js";
import reviewRoutes from "./reviewRoutes.js";
import { getNewArrivals } from "../controllers/productsController.js";
=======
import { addProduct, deleteProduct, getProducts, updateProduct } from "../controllers/productsController.js";
import { requireAdmin, requireAuth } from "../../../middleware/auth.js";
>>>>>>> 752d81f715922372df05e8def3618028bb832c2f

const router = express.Router();

router.get("/hello", (req, res) => {
  res.send("Hello");
});

router.get("/products", getProducts);
<<<<<<< HEAD

router.get("/products/new", getNewArrivals);

router.post("/products", addProduct);

router.use("/:id/reviews", reviewRoutes);
=======
router.post("/products", requireAuth, requireAdmin, addProduct);
router.put("/products/:productId", requireAuth, requireAdmin, updateProduct);
router.delete("/products/:productId", requireAuth, requireAdmin, deleteProduct);
>>>>>>> 752d81f715922372df05e8def3618028bb832c2f

export default router;
