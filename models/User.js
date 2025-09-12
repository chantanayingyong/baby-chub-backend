// models/User.js
/* =========================
 * Imports (ESM)
 *  - Schema, model: สร้างสคีมา/โมเดล
 *  - bcrypt: hash/เปรียบเทียบรหัสผ่าน
 *  - crypto: สร้าง token แบบสุ่มปลอดภัย + แฮช token ก่อนเก็บ
 * ========================= */
import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

/* =========================
 * ค่าคงที่ที่ใช้ในสคีมา
 * ========================= */
const ROLE_ENUM = ["user", "admin"];

// --- อายุช่วงที่อนุญาต (ให้ตรงกับ Frontend) ---
const AGE_MIN = 3;
const AGE_MAX = 15;

// สคีมาช่วงอายุแบบฝัง (embedded) สำหรับเก็บ { from, to }
const targetAgeSchema = new Schema(
  {
    from: {
      type: Number,
      required: true,
      min: [AGE_MIN, `Age "from" must be ≥ ${AGE_MIN}`],
      max: [AGE_MAX, `Age "from" must be ≤ ${AGE_MAX}`],
      validate: {
        validator: Number.isInteger,
        message: 'Age "from" must be an integer',
      },
    },
    to: {
      type: Number,
      required: true,
      min: [AGE_MIN, `Age "to" must be ≥ ${AGE_MIN}`],
      max: [AGE_MAX, `Age "to" must be ≤ ${AGE_MAX}`],
      validate: {
        validator: Number.isInteger,
        message: 'Age "to" must be an integer',
      },
    },
  },
  { _id: false }
);

// ตรวจ from ≤ to
targetAgeSchema.pre("validate", function (next) {
  if (this.from > this.to) {
    return next(new Error('Age "from" must be less than or equal to "to"'));
  }
  next();
});


/* =========================
 * Sub Schemas (ฝังในผู้ใช้)
 * ========================= */

// ที่อยู่ — ใช้กับ PATCH /users/address
const AddressSchema = new Schema(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

// ตัวเลือกการแจ้งเตือน — ใช้กับ PATCH /users/notifications
const NotificationsSchema = new Schema(
  {
    orderUpdates: { type: Boolean, default: true },
    productTips: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
  },
  { _id: false }
);

// รายการสินค้าในคำสั่งซื้อ (สรุปแบบ embed สำหรับ MVP)
const OrderItemSchema = new Schema(
  {
    sku: { type: String, trim: true },
    name: { type: String, trim: true },
    qty: { type: Number, default: 1, min: 1 },
    price: { type: Number, default: 0 },
    downloadable: { type: Boolean, default: false },
    accessUrl: { type: String, trim: true },
    expireDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false }
);

// คำสั่งซื้อ — ใช้กับ GET /users/orders + GET /orders/:orderId
const OrderSchema = new Schema(
  {
    number: { type: String, trim: true }, // หมายเลขคำสั่งซื้อ (ถ้ามี)
    status: { type: String, trim: true, default: "paid" }, // pending|paid|failed|...
    currency: { type: String, trim: true, default: "THB" },
    total: { type: Number, default: 0 },
    items: { type: [OrderItemSchema], default: [] },
    placedAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: false }
);

// เซสชัน/อุปกรณ์ที่ใช้งาน — ใช้กับ GET/DELETE /users/sessions
const SessionSchema = new Schema(
  {
    device: { type: String, trim: true }, // ตัวอย่าง "Chrome on Windows"
    ip: { type: String, trim: true },
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true, timestamps: false }
);

/* =========================
 * Main Schema
 * ========================= */
const UserSchema = new Schema(
  {
    // ---------- บัญชี/สิทธิ์/ความปลอดภัย ----------
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [8, "password must be at least 8 chars"],
      select: false, // ปิดไม่ให้ query ปกติคืนรหัสผ่าน
    },
    role: {
      type: String,
      enum: ROLE_ENUM,
      default: "user",
      index: true,
    },

    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, select: false }, // เก็บ "แฮช" ของ token
    emailVerifyTokenExpiresAt: { type: Date, select: false },

    resetPasswordToken: { type: String, select: false }, // เก็บ "แฮช" ของ token
    resetPasswordExpiresAt: { type: Date, select: false },

    lastLoginAt: { type: Date },
    agreeToPolicyAt: { type: Date },

    // ---------- โปรไฟล์ ----------
    firstName: {
      type: String,
      required: [true, "firstName is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "lastName is required"],
      trim: true,
    },
    mobile: { type: String, trim: true },

    avatarUrl: { type: String, trim: true }, // PATCH/DELETE /users/avatar
    address: { type: AddressSchema, default: {} }, // PATCH /users/address

    //  เก็บช่วงอายุแบบตัวเลข 3–15
    targetAge: {
      type: targetAgeSchema,
      required: true, // ถ้าอยากให้ optional ก็เอาออกได้
    },

    notifications: { type: NotificationsSchema, default: {} }, // PATCH /users/notifications
    newsletter: { type: Boolean, default: false }, // PATCH /users/newsletter

    // ---------- ข้อมูลประกอบ ----------
    orders: { type: [OrderSchema], default: [] }, // GET /users/orders, GET /orders/:orderId
    sessions: { type: [SessionSchema], default: [] }, // GET/DELETE /users/sessions
  },
  {
    timestamps: true, // +createdAt, +updatedAt
    toJSON: { virtuals: true, transform: sanitizeUser },
    toObject: { virtuals: true, transform: sanitizeUser },
  }
);

/* =========================
 * Virtuals (fullName)
 *  - set("Man Suwannason") => firstName="Man", lastName="Suwannason"
 *  - get() => "Man Suwannason"
 * ========================= */
UserSchema.virtual("fullName")
  .get(function () {
    return [this.firstName, this.lastName].filter(Boolean).join(" ");
  })
  .set(function (v) {
    if (typeof v !== "string") return;
    const parts = v.trim().split(/\s+/);
    this.firstName = parts.shift() || "";
    this.lastName = parts.join(" ") || "";
  });

/* =========================
 * JSON Sanitizer
 *  - ลบฟิลด์อ่อนไหวก่อนส่งไป client
 * ========================= */
function sanitizeUser(doc, ret) {
  delete ret.password;
  delete ret.emailVerifyToken;
  delete ret.emailVerifyTokenExpiresAt;
  delete ret.resetPasswordToken;
  delete ret.resetPasswordExpiresAt;

  ret.id = ret._id?.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

/* =========================
 * Hooks & Methods
 * ========================= */

// Hash password อัตโนมัติเมื่อมีการแก้ไข
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ตรวจรหัสผ่าน (ต้อง .select('+password') ตอน query)
UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// สร้างโทเค็นยืนยันอีเมล (คืน token ดิบสำหรับส่งอีเมล แต่เก็บ "แฮช" ลง DB)
UserSchema.methods.setEmailVerifyToken = function (ttlMinutes = 60) {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  this.emailVerifyToken = hash;
  this.emailVerifyTokenExpiresAt = new Date(
    Date.now() + ttlMinutes * 60 * 1000
  );
  return raw; // นำค่านี้ไปแนบลิงก์ ?token=... ในอีเมล
};

// สร้างโทเค็นรีเซ็ตรหัสผ่าน
UserSchema.methods.setResetPasswordToken = function (ttlMinutes = 30) {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  this.resetPasswordToken = hash;
  this.resetPasswordExpiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  return raw;
};

// ตรวจสอบโทเค็นที่ผู้ใช้ส่งมา (verify/reset)
UserSchema.methods.verifyTokenMatches = function (rawToken, kind = "verify") {
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");
  if (kind === "verify") {
    const ok =
      this.emailVerifyTokenExpiresAt &&
      this.emailVerifyTokenExpiresAt > new Date();
    return ok && this.emailVerifyToken === hash;
  } else if (kind === "reset") {
    const ok =
      this.resetPasswordExpiresAt && this.resetPasswordExpiresAt > new Date();
    return ok && this.resetPasswordToken === hash;
  }
  return false;
};

// จัดการ session แบบง่าย (เพิ่ม/อัปเดต/ลบ)
UserSchema.methods.touchSession = function ({ sessionId, device, ip }) {
  const s = this.sessions.id(sessionId);
  if (s) {
    s.lastActive = new Date();
    if (device) s.device = device;
    if (ip) s.ip = ip;
  } else {
    this.sessions.push({ _id: sessionId, device, ip, lastActive: new Date() });
  }
  return this;
};
UserSchema.methods.removeSession = function (sessionId) {
  const s = this.sessions.id(sessionId);
  if (s) s.deleteOne();
  return this;
};

export const User = model("User", UserSchema);
