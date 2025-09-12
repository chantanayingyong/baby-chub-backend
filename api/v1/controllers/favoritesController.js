import { Favorite } from "../../../models/Favorite.js";


export const getProductsInFavorite = async (req, res, next) => {
    const { user } = req;

    try {
    let favorite = await Favorite.findOne(
        { userId: user.id }, 
        { _id: 0, products: 1 }
    )
    .populate('products.productId', '-isDiscounted -tags -age -asset' );

    if (!favorite) {
        favorite = await Favorite.create({ userId: user.id, products: [] });
    }
    
    return res.json({
        error: false,
        favorite,
        message: "Retrieved products from favorite successfully",
    });

    } catch (err) {
        next(err);
    }
};

export const addProductToFavorite = async (req, res, next) => {
    const { productId } = req.body;
    const { user } = req;

    if (!productId) {
        const error = new Error("productId is required");
        error.status = 400;
        return next(error);
    }

    try {
        const existingProduct = await Favorite.findOne({
            userId: user.id,
            products: {
                $elemMatch: { productId }
            }
        });

        if (existingProduct) {
            return res.status(200).json({
                error: false,
                message: "Product in favorite already",
            });
        }

        const favorite = await Favorite.findOneAndUpdate(
            { userId: user.id },
            { $push: { products: { productId } } },
            { new: true, upsert: true }
        );

        res.status(201).json({
            error: false,
            favorite,
            message: "Product added successfully",
        });

    } catch (err) {
        next(err);
    }
};

export const removeProductFromFavorite = async (req, res, next) => {
    const { productId } = req.params;
    const { user } = req;

    try {
        const updatedFavorite = await Favorite.findOneAndUpdate(
            { userId: user.id },
            { $pull: { products: { productId } } },
            { new: true }
        );

        if (!updatedFavorite) {
            const error = new Error("Favorite or product not found");
            error.status = 404;
            return next(error);
        }

        res.json({
            error: false,
            message: "Product deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const clearFavorite = async (req, res, next) => {
    const { user } = req;

    try {
        const updatedFavorite = await Favorite.findOneAndUpdate(
            { userId: user.id },
            { $set: { products: [] } },
            { new: true }
        );

        if (!updatedFavorite) {
            const error = new Error("Favorite not found");
            error.status = 404;
            return next(error);
        }

        res.json({
            error: false,
            message: "Favorite cleared",
        });
    } catch (err) {
        next(err);
    }
};