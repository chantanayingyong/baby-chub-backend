import express from "express";
import { 
    addProductToCart, 
    getProductsInCart, 
    removeProductFromCart, 
    updateProductPlanInCart 
} from "../controllers/cartsController.js";

const router = express.Router();

router.get("/cart", getProductsInCart);
router.post("/cart", addProductToCart);
router.patch("/cart/:productId", updateProductPlanInCart);
router.delete("/cart/:productId", removeProductFromCart);

export default router;
