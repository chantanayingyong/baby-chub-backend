import express from "express";
import { getReviews, addReview } from "../controllers/reviewsController.js";

const reviewRoutes = express.Router({ mergeParams: true });

reviewRoutes.get("/", getReviews);
reviewRoutes.post("/", addReview);

export default reviewRoutes;
