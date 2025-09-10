import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../../../models/User.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

// helper สร้าง access token (JWT) สำหรับ session
const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

const isProd = process.env.NODE_ENV === "production";

// POST /auth/signup
router.post("/signup", async (req, res, next) => {
  try {
    const {
      email,
      password,
      fullName,
      firstName,
      lastName,
      mobile,
      targetAges = [],
      agreeToPolicy,
    } = req.body;
    if (!email || !password || (!fullName && !(firstName && lastName))) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!agreeToPolicy) {
      return res.status(400).json({ message: "Please accept policy/terms" });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already in use" });

    const user = new User({
      email,
      password, // pre('save') จะ hash ให้อัตโนมัติ
      mobile,
      targetAges,
      role: "user",
      agreeToPolicyAt: new Date(),
    });

    // รองรับทั้ง fullName หรือแยกชื่อ
    if (fullName) user.fullName = fullName;
    else {
      user.firstName = firstName;
      user.lastName = lastName;
    }

    // สร้าง email verify token (เก็บ "แฮช" ไว้ใน DB, คืนค่า "raw" ไปส่งอีเมล)
    const raw = user.setEmailVerifyToken(60); // 60 นาที
    await user.save();

    // TODO: ส่งอีเมลยืนยันจริง (SendGrid/Nodemailer)
    const verifyLink = `${process.env.APP_ORIGIN}/verify-email?token=${raw}`;
    console.log("[MOCK EMAIL] Verify:", verifyLink);

    return res
      .status(201)
      .json({ user, message: "Registered. Please verify your email." });
  } catch (err) {
    next(err);
  }
});

// GET /auth/verify-email?token=...
router.get("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Missing token" });

    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      emailVerifyToken: hash,
      emailVerifyTokenExpiresAt: { $gt: new Date() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpiresAt = undefined;
    await user.save();

    return res.json({ message: "Email verified" });
  } catch (err) {
    next(err);
  }
});

// POST /auth/resend-verification { email }
router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user && !user.isEmailVerified) {
      const raw = user.setEmailVerifyToken(60);
      await user.save();
      const verifyLink = `${process.env.APP_ORIGIN}/verify-email?token=${raw}`;
      console.log("[MOCK EMAIL] Verify (resend):", verifyLink);
    }
    return res.json({
      message: "If email exists, verification mail was sent.",
    });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login { email, password }
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    // ต้อง select('+password') เพื่อเทียบ bcrypt
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    user.lastLoginAt = new Date();
    await user.save();

    const token = signAccessToken({ sub: user.id, role: user.role });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 2, // 2 ชั่วโมง
    });

    return res.json({ user: user.toJSON(), message: "Login successful" });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me (ตรวจจาก cookie)
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  return res.json({ user });
});

// POST /auth/forgot-password { email }
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const raw = user.setResetPasswordToken(30); // 30 นาที
      await user.save();
      const resetLink = `${process.env.APP_ORIGIN}/reset-password?token=${raw}`;
      console.log("[MOCK EMAIL] Reset:", resetLink);
    }
    return res.json({ message: "If email exists, reset mail was sent." });
  } catch (err) {
    next(err);
  }
});

// POST /auth/reset-password { token, newPassword }
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Invalid payload" });
    if (newPassword.length < 8)
      return res.status(400).json({ message: "Password too short" });

    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hash,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = newPassword; // จะถูก hash ใน pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    return res.json({ message: "Password reset success" });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax", // ให้ "ตรง" กับตอนตั้งค่า
    path: "/",
  });
  return res.json({ message: "Logged out" });
});

export default router;
