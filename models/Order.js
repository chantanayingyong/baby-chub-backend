import { Schema, model } from "mongoose";

const OrderSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		number: { type: String, required: true, trim: true, unique: true },
		products: [{
			productId: {
				type: Schema.Types.ObjectId,
				ref: 'Product',
				required: true
			},
			productTitle: { type: String, required: true, trim: true },
			type: { type: String, required: true, trim: true },
			purchasePrice: { type: Number, min: 0, required: true },
			plan: {
				type: String,
				required: true,
				trim: true,
				enum: ['oneTime', 'monthly', 'yearly']
			},
		}],
		promoCode: { type: String, trim: true },
		discountAmount: { type: Number, min: 0, default: 0 },
		totalAmount: { type: Number, required: true, min: 0 },
		status: {
			type: String,
			enum: ['pending', 'paid', 'cancelled'],
			default: 'pending'
		},
		paymentMethod: { type: String, trim: true, enum: ['credit_card', 'ShopeePay', 'PromptPay'] },
	}, {
		timestamps: true
	}
);

OrderSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }

    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const datePrefix = `RT-${year}${month}${day}`;

        const lastOrder = await this.constructor.findOne({
                number: new RegExp(`^${datePrefix}`)
            })
            .sort({
                number: -1
            })
            .exec();

        let newCounter = 1;
        if (lastOrder) {
			// using substring to get number in "RT-YYYYMMDD0001"
            const lastCounter = parseInt(lastOrder.number.substring(12), 10);
            newCounter = lastCounter + 1;
        }

        const formattedCounter = String(newCounter).padStart(4, '0');
        this.number = `${datePrefix}${formattedCounter}`;

        next();
    } catch (error) {
        next(error);
    }
});

export const Order = model("Order", OrderSchema);