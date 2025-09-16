import express from "express";
import { getProductById } from "../controllers/productDetailController.js";

const router = express.Router();

router.get("/products/:productId", getProductById);

export default router;
