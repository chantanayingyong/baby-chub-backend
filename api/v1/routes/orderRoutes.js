import express from "express";
import { createOrder, deleteOrder, getOrderById, getOrders, getOrdersByUserId, patchOrderStatus, updateOrderStatus } from "../controllers/ordersController.js";
import { requireAdmin } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/order", getOrdersByUserId);
router.post("/order", createOrder);
router.patch("/order/:orderId", updateOrderStatus);

router.get("/admin/orders", requireAdmin, getOrders);
router.get("/order/:orderId", getOrderById);
router.patch("/admin/order/:orderId", requireAdmin, patchOrderStatus);
router.delete("/admin/order/:orderId", requireAdmin, deleteOrder);


export default router;