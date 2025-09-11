import { Favorite } from "../../../models/Favorite.js";


export const getProductsInFavorite = async (req, res, next) => {
    const { user } = req.user;

    try {
    const favorite = await Favorite.findOne(
        { userId: user._id }, 
        { _id: 0, products: 1 }
    )
    .populate('products.productId', '-isDiscounted -tags -age -asset' );

    if (!favorite) {
        const newFavorite = await Favorite.create(
            { userId: user._id, products: [] },
            { _id: 0, products: 1 }
        );
        
        return res.json({
            error: false,
            favorite: newFavorite,
            message: "Retrieved products from favorite successfully",
        });
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
    const { user } = req.user;

    if (!productId) {
        const error = new Error("productId is required");
        error.status = 400;
        return next(error);
    }

    try {
        const existingProduct = await Favorite.findOne({
            userId: user._id,
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
            { userId: user._id },
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
    const { user } = req.user;

    try {
        const updatedFavorite = await Favorite.findOneAndUpdate(
            { userId: user._id },
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
    const { user } = req.user;

    try {
        const updatedFavorite = await Favorite.findOneAndUpdate(
            { userId: user._id },
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