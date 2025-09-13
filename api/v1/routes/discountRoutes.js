import express from "express";
import { addDiscount, applyDiscount, getAllDiscounts } from "../controllers/discountsController.js";

const router = express.Router();

router.get("/discount", getAllDiscounts);
router.post("/discount", addDiscount);
router.patch("/discount", applyDiscount);



export default router;