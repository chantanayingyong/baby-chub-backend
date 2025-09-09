import express from "express";
import { addProduct, getProducts } from "../controllers/productsController.js";

const router = express.Router();

router.get("/hello", (req, res) => {
    res.send("Hello");
});

router.get("/products", getProducts);

router.post("/products", addProduct);










export default router;