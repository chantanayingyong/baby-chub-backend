import { Schema, model } from "mongoose";

const ProductSchema = new Schema(
	{
		name: { type: String, required: true, minLength: 1, trim: true },
		description: { type: String, required: true, trim: true },
		type: { type: String, required: true, trim: true },
		subjects: { type: [String], lowercase: true, default: [] },
		prices: {
			oneTime: { type: Number, min: 0, required: false, default: null },
			monthly: { type: Number, min: 0, required: false, default: null },
			yearly: { type: Number, min: 0, required: false, default: null }
		},
		isDiscounted: { type: Boolean, required: true, default: false },
		tags: { type: [String], default: [] },
		age: {
			min: { type: Number, min: 0, default: 3 },
			max: { type: Number, min: 0, default: 12 }
		},
		images: { type: [String], trim: true },
		available: { type: Boolean, default: false },
		asset: {
			path: { type: String, required: true, trim: true },
			type: { type: String, required: true, trim: true }
		},
	}, {
		timestamps: true
	}
);

export const Product = model("Product", ProductSchema);