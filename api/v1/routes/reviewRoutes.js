import express from "express";
import { requireAuth } from "../../../middleware/auth.js";
import {
  getReviews,
  addReview,
  editReview,
  deleteReview,
  togglePin,
} from "../controllers/reviewsController.js";

const reviewRoutes = express.Router({ mergeParams: true });

reviewRoutes.get("/", getReviews);
reviewRoutes.post("/", requireAuth, addReview);
reviewRoutes.patch("/:reviewId", requireAuth, editReview);
reviewRoutes.delete("/:reviewId", requireAuth, deleteReview);
reviewRoutes.patch("/:reviewId/pin", requireAuth, togglePin);

export default reviewRoutes;
