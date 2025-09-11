import express from "express";
import { User } from "../../../models/User.js";
import { requireAuth } from "../../../middleware/auth.js";

const router = express.Router();

// GET /users  (โปรไฟล์ตัวเอง)
router.get("/users", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  return res.json({ user });
});

// PATCH /users  (อัปเดตชื่อ/มือถือ/targetAges)
router.patch("/users", requireAuth, async (req, res) => {
  const { firstName, lastName, mobile, targetAges } = req.body;
  const updates = {};
  if (typeof firstName === "string") updates.firstName = firstName;
  if (typeof lastName === "string") updates.lastName = lastName;
  if (typeof mobile === "string") updates.mobile = mobile;
  if (Array.isArray(targetAges)) updates.targetAges = targetAges;

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
  });
  return res.json({ user });
});

// PATCH /users/password  { currentPassword, newPassword }
router.patch("/users/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Invalid payload" });
  if (newPassword.length < 8)
    return res.status(400).json({ message: "Password too short" });

  const user = await User.findById(req.user.id).select("+password");
  if (!user || !(await user.comparePassword(currentPassword)))
    return res.status(400).json({ message: "Current password incorrect" });

  user.password = newPassword; // pre('save') จะ hash ให้
  await user.save();
  return res.json({ message: "Password changed" });
});

// PATCH /users/avatar { avatarUrl }
router.patch("/users/avatar", requireAuth, async (req, res) => {
  const { avatarUrl } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatarUrl },
    { new: true }
  );
  return res.json({ user });
});

// DELETE /users/avatar
router.delete("/users/avatar", requireAuth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatarUrl: "" },
    { new: true }
  );
  return res.json({ user });
});

// PATCH /users/address { line1,line2,city,state,postalCode,country }
router.patch("/users/address", requireAuth, async (req, res) => {
  const { line1, line2, city, state, postalCode, country } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { address: { line1, line2, city, state, postalCode, country } },
    { new: true }
  );
  return res.json({ user });
});

// PATCH /users/notifications { orderUpdates, productTips, promotions }
router.patch("/users/notifications", requireAuth, async (req, res) => {
  const { orderUpdates, productTips, promotions } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { notifications: { orderUpdates, productTips, promotions } },
    { new: true }
  );
  return res.json({ user });
});

// PATCH /users/newsletter { newsletter }
router.patch("/users/newsletter", requireAuth, async (req, res) => {
  const { newsletter } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { newsletter: !!newsletter },
    { new: true }
  );
  return res.json({ user });
});

// GET /users/orders
router.get("/users/orders", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id, { orders: 1 });
  return res.json({ orders: user?.orders ?? [] });
});

// GET /orders/:orderId
router.get("/orders/:orderId", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id, { orders: 1 });
  const order = user?.orders.id(req.params.orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.json({ order });
});

// GET /users/sessions
router.get("/users/sessions", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id, { sessions: 1 });
  return res.json({ sessions: user?.sessions ?? [] });
});

// DELETE /users/sessions/:sessionId
router.delete("/users/sessions/:sessionId", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  user.removeSession(req.params.sessionId);
  await user.save();
  return res.status(204).send();
});

// DELETE /users (ลบบัญชีตัวเอง)
router.delete("/users", requireAuth, async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
  return res.status(204).send();
});

export default router;
