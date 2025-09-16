// middleware/auth.js
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };

    // ต้องมี sid จาก cookie และต้องเป็น ObjectId ที่ถูกต้อง
    const sid = req.cookies?.sid;
    const isValidObjectId =
      typeof sid === "string" && /^[a-fA-F0-9]{24}$/.test(sid);
    if (!isValidObjectId) {
      // ไม่มี sid หรือไม่ถูกต้อง -> ถือว่าไม่ผ่าน (กันกรณี re-create session เอง)
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ตรวจว่า sid นี้อยู่ใน sessions ของผู้ใช้จริงไหม
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const exists = (user.sessions || []).some(
      (s) => String(s._id) === String(sid)
    );
    if (!exists) {
      // ถูก revoke ไปแล้ว -> ตอบ 401 ให้เด้งออก
      return res.status(401).json({ message: "Session revoked" });
    }

    // อัปเดต lastActive แบบ best-effort (แนะนำทำใน controller เฉพาะที่ต้องการก็ได้)
    await User.updateOne(
      { _id: user._id, "sessions._id": new mongoose.Types.ObjectId(sid) },
      { $set: { "sessions.$.lastActive": new Date() } }
    );

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });
  next();
};
