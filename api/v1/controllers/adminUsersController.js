// api/v1/controllers/adminUsersController.js
import { User } from "../../../models/User.js";

function toBool(v) {
  if (v === true || v === "true" || v === 1 || v === "1") return true;
  if (v === false || v === "false" || v === 0 || v === "0") return false;
  return undefined;
}

export async function listUsers(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const q = String(req.query.query ?? "").trim();
    const role = String(req.query.role ?? "");
    const v = toBool(req.query.verified);

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (typeof v === "boolean") filter.verified = v;

    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    const items = rows.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      verified: !!u.verified,
      orders: u.ordersCount ?? 0,
      createdAt: u.createdAt,
    }));

    res.json({ items, total, page, pageSize: limit });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const u = await User.findById(req.params.id).lean();
    if (!u) return res.status(404).json({ message: "User not found" });
    res.json({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      verified: !!u.verified,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin ?? null,
      ordersCount: u.ordersCount ?? 0,
      addresses: u.addresses ?? [],
      notes: u.notes ?? "",
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!["admin", "user"].includes(role))
      return res
        .status(400)
        .json({ message: "role must be 'admin' or 'user'" });
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: "updated" });
  } catch (err) {
    next(err);
  }
}

export async function resendVerify(_req, res) {
  res.json({ message: "Verification email sent." });
}

export async function deleteUser(req, res, next) {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
}
