import express from "express";
import { addDiscount, getAllDiscounts } from "../controllers/discountsController.js";

const router = express.Router();

router.get("/discount", getAllDiscounts);
router.post("/discount", addDiscount);



export default router;