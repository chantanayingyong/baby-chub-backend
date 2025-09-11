import { Discount } from "../../../models/Discount.js";


export const getAllDiscounts = async (req, res, next) => {
    try {
        const discount = await Discount.find();

        res.json({
            error: false,
            discount,
            message: "All discounts retrieved successfully"
        });

    } catch (err) {
        next(err);
    }
};

export const addDiscount = async (req, res, next) => {
    const { code, isPercent, amount, expireDate, isActive, minimumPurchaseAmount, remaining } = req.body;
    
    const isValidDate = (date) => {
        const dateObject = new Date(date);
        return dateObject instanceof Date && !Number.isNaN(dateObject.valueOf()) && dateObject > Date.now();
    };

    const isValidNumber = (number) => {
        return typeof number === 'number' && Number.isFinite(number) && number >= 0;
    };

    if (!code) {
        const error = new Error("Discount code is required");
        error.status = 400;
        return next(error);
    }

    if (typeof isPercent !== 'boolean') {
        const error = new Error("Is percent discount or not?");
        error.status = 400;
        return next(error);
    }
    
    if (!isValidNumber(amount)) {
        const error = new Error("Code is required");
        error.status = 400;
        return next(error);
    }

    if (!isValidDate(expireDate)) {
        const error = new Error("Date is invalid format");
        error.status = 400;
        return next(error);
    }

    if (typeof isActive !== 'boolean') {
        const error = new Error("Is discount active or not?");
        error.status = 400;
        return next(error);
    }

    if (!isValidNumber(minimumPurchaseAmount)) {
        const error = new Error("Minimum purchase amount is required");
        error.status = 400;
        return next(error);
    }

    if (!isValidNumber(remaining)) {
        const error = new Error("Remaining discount is required");
        error.status = 400;
        return next(error);
    }

    try {
        const discount = await Discount.create({
            code,
            isPercent,
            amount,
            expireDate,
            isActive,
            minimumPurchaseAmount,
            remaining
        });

        res.status(201).json({
            error: false,
            discount,
            message: "Discount added successfully"
        });

    } catch (err) {
        next(err);
    }
};