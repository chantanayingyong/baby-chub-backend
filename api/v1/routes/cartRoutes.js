import express from "express";
import { 
    addProductToCart, 
    clearCart, 
    getProductsInCart, 
    removeProductFromCart, 
    updateProductPlanInCart 
} from "../controllers/cartsController.js";

const router = express.Router();

router.get("/cart", getProductsInCart);
router.post("/cart", addProductToCart);
// router.post("/favorite-cart", addFavoriteToCart);
router.patch("/cart/:productId", updateProductPlanInCart);
router.delete("/cart/:productId", removeProductFromCart);
router.delete("/cart", clearCart);

export default router;
