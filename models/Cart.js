import { Schema, model } from "mongoose";

const ReviewSchema = new Schema(
 {       userId: {
			    type: Schema.Types.ObjectId,
			    ref: 'User',
			    required: true,
			    unique: true
		    },        rating: { type: Number, min: 1, default: 5 },        comment: { type: String, required: true, trim: true },  }, {
		timestamps: true
	}
);