import { Schema, model } from "mongoose";

const CartSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true
		},
		products: [{
			productId: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: true
			},
			plan: {
				type: String,
				required: true,
				trim: true,
				enum: ['oneTime', 'monthly', 'yearly']
			}
		}],
	}, {
		timestamps: true
	}
);

export const Cart = model("Cart", CartSchema);