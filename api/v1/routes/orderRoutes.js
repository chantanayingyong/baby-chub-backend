import express from "express";
import { createOrder, getOrdersByUserId, updateOrderStatus } from "../controllers/ordersController.js";


const router = express.Router();

router.get("/order", getOrdersByUserId);
router.post("/order", createOrder);
router.patch("/order/:orderId", updateOrderStatus);



export default router;