import express from "express";
import { createOrder, getOrdersByUserId } from "../controllers/ordersController.js";


const router = express.Router();

router.get("/order", getOrdersByUserId);
router.post("/order", createOrder);
// router.patch("/order", updateOrder);
// router.patch("/order/promo", checkPromoCode);



export default router;