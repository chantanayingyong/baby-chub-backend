import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderItemId: {
      type: String, // sub-id เฉพาะภายใน order
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productTitle: { type: String, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
      index: true,
    },
    expireAt: {
      type: Date,
      default: null, // null = ไม่มีวันหมดอายุ สินค้า onetime purchase
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // สำหรับ track % progress เช่น คอร์สเรียน
    },
  },
  { timestamps: true, versionKey: false }
);

// Compound Index
librarySchema.index({ userId: 1, status: 1, expireAt: 1 });
// Unique constraint กันไม่ให้ user มี orderItemId ซ้ำมากกว่า 1
librarySchema.index({ userId: 1, orderItemId: 1 }, { unique: true });

export default mongoose.model("Library", librarySchema);
