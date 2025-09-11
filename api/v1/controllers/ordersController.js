// import { Order } from "../../../models/Order";

/*
export const getOrdersByUserId = async (req, res, next) => {
    const { user } = req;
    
    try {
    const order = await Order.find(
        { userId: user.id }, 
        { _id: 0, userId: 0 }
    );
    // .populate('products.productId', '-isDiscounted -tags -age -asset' );

    if (!order) {
        const error = new Error("Order not found");
        error.status = 404;
        return next(error);
    }
    
    return res.json({
        error: false,
        order,
        message: "Retrieved orders successfully",
    });

    } catch (err) {
        next(err);
    }
};

export const createOrder = async (req, res, next) => {
    const { products, paymentMethod } = req.body;
    const { user } = req;

    // {
    //     "number": "",
    //     "products": [{
    //         "productId": "",
    //         "productTitle": "",
    //         "type": "",
    //         "purchasePrice": 00,
    //         "plan": ""
    //     }],
    //     "promoCode": "",
    //     "discountAmount": 0,
    //     "totalAmount": 00,
    //     "status": "pending",
    //     "paymentMethod": "credit_card"
    // }

    


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
*/