import { Review } from "../../../models/Review.js";

export const getReviews = async (req, res, next) => {
  const productId = req.params.productId;
  try {
    const reviews = await Review.find({ productId })
      .populate("userId", "firstName lastName avatarUrl")
      .sort({
        isPinned: -1,
        createdAt: -1,
      });
    return res.json({
      error: false,
      reviews,
      message: "All reviews retrieved successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const addReview = async (req, res, next) => {
  const { rating, comment, isPinned } = req.body;
  const productId = req.params.productId;
  const userId = req.user?.id;

  if (!rating || !comment || !userId) {
    return res.status(400).json({ error: true, message: "Unauthorized" });
  }

  try {
    const existReview = await Review.findOne({ productId, userId });
    if (existReview) {
      return res
        .status(409)
        .json({ error: true, message: "You already reviewed this product" });
    }

    const review = await Review.create({
      productId,
      userId,
      rating,
      comment,
      isPinned,
    });

    return res.status(201).json({
      error: false,
      review,
      message: "Review added successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const editReview = async (req, res, next) => {
  const reviewId = req.params.reviewId;
  const { rating, comment, isPinned } = req.body;
  // const { user } = req.user

  if (!rating && !comment) {
    return res
      .status(400)
      .json({ error: true, message: "Rating and comment is required" });
  }

  try {
    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
      return res.status(404).json({ error: true, message: "Review not found" });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (typeof isPinned === "boolean") {
      review.isPinned = isPinned;
    }

    await review.save();

    return res.json({
      error: false,
      review,
      message: "Review updated successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (req, res, next) => {
  const { reviewId, productId } = req.params; // เอา productId จาก params
  const userId = req.user?.id; // ตรวจ owner

  try {
    const review = await Review.findOne({ _id: reviewId, productId, userId });

    if (!review) {
      return res
        .status(404)
        .json({ error: true, message: "Review not found or unauthorized" });
    }

    await Review.deleteOne({ _id: reviewId, productId, userId });

    return res.json({
      error: false,
      message: "Review deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const togglePin = async (req, res, next) => {
  const reviewId = req.params.reviewId;
  // const { user } = req.user;

  try {
    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
      return res.status(404).json({
        error: true,
        message: "Review not found.",
      });
    }

    review.isPinned = !review.isPinned;
    await review.save();

    return res.json({
      error: false,
      review,
      message: `Review has been ${
        review.isPinned ? "pinned" : "unpinned"
      } successfully`,
    });
  } catch (err) {
    next(err);
  }
};
