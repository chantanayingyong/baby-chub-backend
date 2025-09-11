import { Product } from "../../../models/Product.js";





// get products by query
export const getProducts = async (req, res) => {
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

        console.log('filter:', filter)

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort({ createAt: -1 })
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
    console.log(newProduct);
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

