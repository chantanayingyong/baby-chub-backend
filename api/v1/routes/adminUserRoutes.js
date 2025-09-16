// api/v1/routes/adminUserRoutes.js
import { Router } from "express";
import {
  listUsers,
  getUserById,
  updateUserRole,
  resendVerify,
  deleteUser,
} from "../controllers/adminUsersController.js";

// ถ้ามี middleware ตรวจ admin ให้ใส่ตรงนี้ เช่น:
// import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

// router.use(requireAdmin); // เปิดใช้ถ้ามี

// GET /api/v1/admin/users?query=&role=&verified=&page=&limit=
router.get("/users", listUsers);

// GET /api/v1/admin/users/:id
router.get("/users/:id", getUserById);

// PATCH /api/v1/admin/users/:id  body: { role: "admin"|"user" }
router.patch("/users/:id", updateUserRole);

// POST /api/v1/admin/users/:id/resend-verify
router.post("/users/:id/resend-verify", resendVerify);

// DELETE /api/v1/admin/users/:id
router.delete("/users/:id", deleteUser);

export default router;
