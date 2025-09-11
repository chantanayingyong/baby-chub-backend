import { Cart } from "../../../models/Cart.js";

export const getProductsInCart = async (req, res, next) => {
    const { user } = req;

    try {
    let cart = await Cart.findOne(
        { userId: user.id }, 
        { _id: 0, products: 1 }
    )
    .populate('products.productId', '-isDiscounted -tags -age -asset' );
    
    if (!cart) {
        cart = await Cart.create({ userId: user.id, products: [] });
    }
    // console.log('cart:', cart)
    return res.json({
        error: false,
        cart,
        message: "Retrieved products from cart successfully",
    });

    } catch (err) {
        next(err);
    }
};

export const addProductToCart = async (req, res, next) => {
    const { productId, plan } = req.body;
    const { user } = req;

    if (!productId) {
        const error = new Error("productId is required");
        error.status = 400;
        return next(error);
    }

    if (!plan) {
        const error = new Error("Product plan is required");
        error.status = 400;
        return next(error);
    }

    try {
        const existingProduct = await Cart.findOne({
            userId: user.id,
            products: {
                $elemMatch: { productId }
            }
        });

        if (existingProduct) {
            return res.status(200).json({
                error: false,
                message: "Product in cart already",
            });
        }

        const cart = await Cart.findOneAndUpdate(
            { userId: user.id },
            { $push: { products: { productId, plan } } },
            { new: true, upsert: true }
        );

        res.status(201).json({
            error: false,
            cart,
            message: "Product added successfully",
        });

    } catch (err) {
        next(err);
    }
};

/*
export const addFavoriteToCart = async (req, res, next) => {
    const { productId } = req.body;
    const { user } = req;

    if (!productId) {
        const error = new Error("productId is required");
        error.status = 400;
        return next(error);
    }

    try {
        const existingProduct = await Cart.findOne({
            userId: user.id,
            products: {
                $elemMatch: { productId }
            }
        });

        if (existingProduct) {
            const error = new Error("Product in cart already");
            error.status = 400;
            return next(error);
        }

        const plan = 

        const cart = await Cart.findOneAndUpdate(
            { userId: user.id },
            { $push: { products: { productId, plan: "" } } },
            { new: true, upsert: true }
        );

        res.status(201).json({
            error: false,
            cart: cart.products,
            message: "Product added successfully",
        });

    } catch (err) {
        next(err);
    }
};
*/

export const updateProductPlanInCart = async (req, res, next) => {
    const { productId } = req.params;
    const { plan } = req.body;
    const { user } = req;

    try {
        const updateCart = await Cart.findOneAndUpdate(
            {
                userId: user.id,
                'products.productId': productId
            },
            {
                $set: { 'products.$.plan': plan }
            },
            { new: true }
        );

        if (!updateCart) {
            const error = new Error("Cart or product not found");
            error.status = 404;
            return next(error);
        }

        res.json({
            error: false,
            message: "Product plan updated successfully",
        });

    } catch (err) {
        next(err);
    }
};

export const removeProductFromCart = async (req, res, next) => {
    const { productId } = req.params;
    const { user } = req;

    try {
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: user.id },
            { $pull: { products: { productId } } },
            { new: true }
        );

        if (!updatedCart) {
            const error = new Error("Cart or product not found");
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

export const clearCart = async (req, res, next) => {
    const { user } = req;

    try {
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: user.id },
            { $set: { products: [] } },
            { new: true }
        );

        if (!updatedCart) {
            const error = new Error("Cart not found");
            error.status = 404;
            return next(error);
        }

        res.json({
            error: false,
            message: "Cart cleared",
        });
    } catch (err) {
        next(err);
    }
};