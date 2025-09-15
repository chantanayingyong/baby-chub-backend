import { Schema, model } from "mongoose";

const FavoriteSchema = new Schema(
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
			}
		}],
	}, {
		timestamps: true
	}
);

export const Favorite = model("Favorite", FavoriteSchema);