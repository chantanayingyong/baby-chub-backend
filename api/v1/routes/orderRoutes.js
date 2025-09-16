import express from "express";
import { createOrder, deleteOrder, getOrderById, getOrders, getOrdersByUserId, patchOrderStatus, updateOrderStatus } from "../controllers/ordersController.js";


const router = express.Router();

router.get("/order", getOrdersByUserId);
router.post("/order", createOrder);
router.patch("/order/:orderId", updateOrderStatus);

router.get("/admin/orders", getOrders);
router.get("/order/:orderId", getOrderById);
router.patch("/admin/order/:orderId", patchOrderStatus);
router.delete("/admin/order/:orderId", deleteOrder);


export default router;