import { Schema, model } from "mongoose";

const DiscountSchema = new Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},
		isPercent: {
			type: Boolean,
			required: true,
		},
		amount: {
			type: Number,
			required: true,
			min: 0
		},
		expireDate: {
			type: Date,
			required: false
		},
		isActive: {
			type: Boolean,
			required: true,
			default: false
		},
		minimumPurchaseAmount: {
			type: Number,
			required: false,
			min: 0
		},
		remaining: {
			type: Number,
			required: false,
			min: 0
		}
	}, {
		timestamps: true
	}
);

DiscountSchema.pre('save', function(next) {  
	if (this.isPercent && this.amount > 100) {  
		next(new Error('Percentage discount cannot exceed 100.'));  
	}  
	next();  
});

export const Discount = model("Discount", DiscountSchema);