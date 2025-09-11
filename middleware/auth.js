// ตรวจสอบผู้ใช้จาก accessToken ใน httpOnly cookie
import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // แนบข้อมูลไว้ใน req เพื่อใช้ต่อใน controller/route อื่น
    req.user = { id: payload.sub, role: payload.role };
    console.log("req.user.id:", req.user.id)
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
