import { Product } from "../../../models/Product.js";

export const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: true,
        message: "Product not found",
      });
    }

    return res.json({
      error: false,
      product,
      message: "Product retrieved successful",
    });
  } catch (err) {
    next(err);
  }
};
