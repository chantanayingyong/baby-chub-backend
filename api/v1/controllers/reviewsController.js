import { Review } from "../../../models/Review.js";

export const getReviews = async (req, res) => {
  const { id: productId } = req.params;
  try {
    const reviews = await Review.find({ productId }).sort({
      isPinned: -1,
      createdAt: -1,
    });
    return res.json({
      error: false,
      reviews,
      message: "All reviews retrieved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Failed to fetch reviews",
      details: err.message,
    });
  }
};

export const addReview = async (req, res) => {
  const { rating, comment, isPinned = false } = req.body;
  const { id: productId } = req.params;
  // const userId = req.user.user.id;

  if (!rating) {
    return res.status(400).json({ error: true, message: "Rating is required" });
  }

  if (!comment) {
    return res
      .status(400)
      .json({ error: true, message: "Comment is required" });
  }

  // if (!userId) {
  //   return res
  //     .status(401)
  //     .json({ error: true, message: "Unauthorized - no user ID found" });
  // }

  try {
    // const existReview = await Review.findOne({ productId, userId });
    // if (existReview) {
    //   return res
    //     .status(409)
    //     .json({ error: true, message: "You already reviewed this product" });
    // }

    const review = await Review.create({
      productId,
      // userId,
      rating,
      comment,
      isPinned,
    });

    return res.status(201).json({
      error: false,
      review,
      message: "Review added successfully",
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};
