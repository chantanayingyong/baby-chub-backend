import { Discount } from "../../../models/Discount.js";
import Library from "../../../models/Library.js";
import { Order } from "../../../models/Order.js";
import { Product } from "../../../models/Product.js";


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
    const { products = [], promoCode = "", paymentMethod } = req.body;
    const { user } = req;

    const isValidProduct = (products) => {
        return products.every(item => (
            typeof item?.productId === 'string' && typeof item?.plan === 'string'
        ));
    };

    if (products.length === 0) {
        const error = new Error("Product is required");
        error.status = 400;
        return next(error);
    }

    if (!isValidProduct(products)) {
        const error = new Error("Product id or product plan is missing");
        error.status = 400;
        return next(error);
    }

    if (typeof paymentMethod !== 'string') {
        const error = new Error("Payment method is required");
        error.status = 400;
        return next(error);
    }

    try {
        const productIdList = products.map(item => item.productId);

        const checkoutItems = await Product.find(
            { _id: { "$in": productIdList }, available: true }
        );

        if (!checkoutItems) {
            const error = new Error("Products are not available");
            error.status = 400;
            return next(error);
        }

        const orderProducts = products.map(userProduct => {
            const dbProduct = checkoutItems.find(item => item._id.toString() === userProduct.productId);
            
            if (!dbProduct) {
                const error = new Error(`Product not found: ${userProduct.productId}`);
                error.status = 400;
                return next(error);
            }
            
            const purchasePrice = dbProduct.prices[userProduct.plan];
            if (purchasePrice === undefined) {
                const error = new Error(`Invalid plan '${userProduct.plan}' for product ${dbProduct.name}`);
                error.status = 400;
                return next(error);
            }

            return {
                productId: dbProduct._id,
                productTitle: dbProduct.name,
                productType: dbProduct.type,
                purchasePrice,
                plan: userProduct.plan,
            }
        });

        const subTotalAmount = orderProducts.reduce((acc, product) => acc + product.purchasePrice, 0);

        let discount = null;
        
        if (promoCode) {
            discount = await Discount.findOneAndUpdate(
                { 
                    code: promoCode, 
                    isActive: true,
                    expireDate: { "$gt": new Date() },
                    remaining: { "$gt": 0 }
                },
                { "$inc": { remaining: -1 } },
                { new: true }
            );
        }

        const totalAmount = !discount || subTotalAmount < discount.minimumPurchaseAmount
            ? subTotalAmount
            : discount.isPercent
            ? Math.round(subTotalAmount * (1 - (discount.amount * 0.01)))
            : Math.round(subTotalAmount - discount.amount);
        
        const newOrder = new Order({
            userId: user.id,
            products: orderProducts, // Use the newly constructed array
            promoCode,
            discountAmount: subTotalAmount - totalAmount,
            totalAmount,
            paymentMethod,
            status: 'pending'
        });

        const order = await newOrder.save();
        // console.log('order.id:', order.id)
        res.status(201).json({
            error: false,
            order,
            message: "Order created successfully",
        });

    } catch (err) {
        next(err);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || (status !== 'paid' && status !== 'cancelled')) {
        const error = new Error("Invalid status provided. Status must be 'paid' or 'cancelled'");
        error.status = 400;
        return next(error);
    }

    try {
        // console.log('orderId:', orderId, 'status:', status)
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            { "$set": { status: status } },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            const error = new Error("Order not found");
            error.status = 404;
            return next(error);
        }

        let libraryStatus = null;
        if (updatedOrder.status === 'paid') {
            const libraryItems = updatedOrder.products.map(item => ({
                userId: updatedOrder.userId,
                orderId: updatedOrder._id,
                orderItemId: item._id,
                productId: item.productId,
                productTitle: item.productTitle,
                type: item.productType,
                expireAt: item.plan === 'oneTime' ? null 
                    : item.plan === 'monthly' ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                    : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                progress: 0,
            }));

            try {
                await Library.insertMany(libraryItems, { ordered: false });
                libraryStatus = "Products added to library";
                
            } catch (err) {
                console.error("Failed to add products to library:", err);

                if (err.code === 11000) {
                    libraryStatus = "Some products were already in the user's library";
                } else {
                    libraryStatus = "Failed to add products to library";
                }
            }    
        }

        res.status(201).json({
            error: false,
            message: "Order updated successfully",
            libraryStatus
        });
        
    } catch (err) {
        next(err);
    }
};

export const getOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('userId', 'firstName lastName email')
            .skip((page - 1) * limit)
            .limit(parseInt(limit, 10))
            .sort({ createdAt: -1 });

        const totalOrders = await Order.countDocuments(query);

        res.json({
            error: false,
            items: orders,
            total: totalOrders,
            page: parseInt(page, 10),
            pageSize: parseInt(limit, 10),
            message: "Retrieved orders successfully",
        });

    } catch (err) {
        next(err);
    }
};

export const getOrderById = async (req, res, next) => {
    const { orderId } = req.params;
    
    try {
        const order = await Order.findById(orderId).populate('userId', 'firstName lastName email');
        
        if (!order) {
            const error = new Error("Order not found");
            error.status = 404;
            return next(error);
        }
        
        return res.json({
            error: false,
            order,
            message: "Retrieved order successfully",
        });

    } catch (err) {
        if (err.kind === 'ObjectId') {
            const error = new Error("Invalid order ID");
            error.status = 400;
            return next(error);
        }
        next(err);
    }
};

export const patchOrderStatus = async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['paid', 'cancelled'].includes(status)) {
        const error = new Error("Invalid status provided");
        error.status = 400;
        return next(error);
    }

    try {
        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            const error = new Error("Order not found");
            error.status = 404;
            return next(error);
        }

        res.json({
            error: false,
            order,
            message: `Order status updated to ${status}`,
        });

    } catch (err) {
        if (err.kind === 'ObjectId') {
            const error = new Error("Invalid order ID");
            error.status = 400;
            return next(error);
        }
        next(err);
    }
};

export const deleteOrder = async (req, res, next) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            const error = new Error("Order not found");
            error.status = 404;
            return next(error);
        }

        res.json({
            error: false,
            message: "Order deleted successfully",
        });

    } catch (err) {
        if (err.kind === 'ObjectId') {
            const error = new Error("Invalid order ID");
            error.status = 400;
            return next(error);
        }
        next(err);
    }
};