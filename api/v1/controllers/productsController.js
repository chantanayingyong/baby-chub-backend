import { Product } from "../../../models/Product.js";

const parseArray = (val) => {
    if (!val) return [];
    try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
} catch {
    return [];
}
};



// get products by query
export const getProducts = async (req, res, next) => {
    const { age, price, type, subject } = req.query;
    // console.log('req.query:', req.query);
    
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitRaw = parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(Math.max(1, limitRaw), 100);
    const q = (req.query.q || "").toString().trim();
    
    try {
        const filter = {};
        filter.$and = [];

        if (q) {
            const regex = new RegExp(q, "i");
            filter.$and.push(
                { $or : [
                    { name: { $regex: regex } },
                    { description: { $regex: regex } },
                    { type: { $regex: regex } },
                    { subjects: { $regex: regex } },
                    { tags: { $regex: regex } },
                ] }
            );
        }

        if (age) {
            const ageList = JSON.parse(age);
            const condition = [];

            ageList.forEach(item => {
                condition.push(
                    { "age.min": { "$gte": item.min, "$lte": item.max } }
                );
            });
            filter.$and.push({ $or: condition });
        }

        if (price) {
            const priceList = JSON.parse(price);
            const condition = [];

            priceList.forEach(item => {
                condition.push(
                    { "prices.oneTime": { "$gte": item.min, "$lte": item.max } },
                    { "prices.monthly": { "$gte": item.min, "$lte": item.max } },
                    { "prices.yearly": { "$gte": item.min, "$lte": item.max } },
                );
            });
            filter.$and.push({ $or: condition });
        }

        if (type) {
            const typeList = JSON.parse(type);
            // filter.type = { "$in": typeList };
            filter.$and.push( { "type": { "$in": typeList } } );
        }

        if (subject) {
            const subjectList = JSON.parse(subject);
            // filter.subjects = { "$in": subjectList };
            filter.$and.push( { "subjects": { "$in": subjectList } } );
        }

        // console.log('filter:', filter)

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        return res.json({
            error: false,
            products,
            total,
            page,
            message: "All products retrieved successfully"
        });

    } catch (err) {
        next(err);
    }
};

// add new product
export const addProduct = async (req, res, next) => {
    const newProduct = req.body;
    // console.log(newProduct);
    try {
        const product = await Product.create(newProduct);
        res.status(201).json({
            error: false,
            product,
            message: "Product added successfully"
        });
    } catch (err) {
        next(err);
    }
};

//new arrivals

export const getNewArrivals = async (req, res, next) => {
    try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limitRaw = parseInt(req.query.limit, 10) || 12;
    const limit = Math.min(Math.max(1, limitRaw), 50);
    const skip = (page - 1) * limit;

    const availableOnly = String(req.query.availableOnly ?? "true") === "true";
    const filter = availableOnly ? { available: true } : {};

    const [items, total] = await Promise.all([
        Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Product.countDocuments(filter),
    ]);

    res.json({ error: false, page, limit, total, products: items });
} catch (err) {
    next(err);
}
};
// update a product
export const updateProduct = async (req, res, next) => {
    const { productId } = req.params;
    const product = req.body;

    if (!product) {
        const error = new Error("Product is required");
        error.status = 400;
        return next(error);
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            product,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            const error = new Error("Product not found");
            error.status = 404;
            return next(error);
        }

        res.status(201).json({
            error: false,
            message: "Product updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

// delete a product
export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params;
    try {
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            const error = new Error("Product not found");
            error.status = 404;
            return next(error);
        }

        res.status(200).json({
            error: false,
            message: "Product deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

