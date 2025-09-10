import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    /* RELATIONSHIP REFERENCES */
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
      type: String, // ใช้เก็บ sub-id เฉพาะภายใน order
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    /** -------------------------
     *  PRODUCT INFORMATION
     * ------------------------- */
    productTitle: { type: String, required: true },
    type: {
      type: String,
      enum: ["subscription", "digital", "content"],
      required: true,
    },

    /** -------------------------
     *  USAGE STATUS
     * ------------------------- */
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
      index: true,
    },
    expireAt: {
      type: Date,
      default: null, // null = ไม่มีวันหมดอายุ
    },
    progress: {
      type: Number,
      default: 0, // สำหรับ track % progress เช่น คอร์สเรียน
    },

    /** -------------------------
     *  META
     * ------------------------- */
  },
  { timestamps: true }
);

// Compound Index (ใช้ query บ่อย: library ของ user, ตามสถานะ และ expireAt)
librarySchema.index({ userId: 1, status: 1, expireAt: 1 });

export default mongoose.model("Library", librarySchema);
