import express from "express";
import { 
    addProductToFavorite, 
    clearFavorite, 
    getProductsInFavorite, 
    removeProductFromFavorite
} from "../controllers/favoritesController.js";

const router = express.Router();

router.get("/favorite", getProductsInFavorite);
router.post("/favorite", addProductToFavorite);
router.delete("/favorite/:productId", removeProductFromFavorite);
router.delete("/favorite", clearFavorite);

export default router;