import express from "express";
import { addDiscount, applyDiscount, getAllDiscounts } from "../controllers/discountsController.js";
import { requireAdmin, requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

router.get("/discount", requireAuth, requireAdmin, getAllDiscounts);
router.post("/discount", requireAuth, requireAdmin, addDiscount);
router.patch("/discount", applyDiscount);



export default router;