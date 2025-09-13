import express from "express";
import {
  getReviews,
  addReview,
  editReview,
  deleteReview,
  togglePin,
} from "../controllers/reviewsController.js";

const reviewRoutes = express.Router({ mergeParams: true });

reviewRoutes.get("/", getReviews);
reviewRoutes.post("/", addReview);
reviewRoutes.patch("/:reviewId", editReview);
reviewRoutes.delete("/:reviewId", deleteReview);
reviewRoutes.patch("/:reviewId/pin", togglePin);

export default reviewRoutes;
