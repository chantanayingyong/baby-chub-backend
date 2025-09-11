import express from "express";
import {
  addLibraryItem,
  getUserLibraries,
  getActiveLibraries,
  getExpiredLibraries,
  updateLibraryItem,
  deleteLibraryItem,
} from "../controllers/librariesController.js";

const router = express.Router();

// เพิ่ม purchased item (หลัง order confirmed)
router.post("/users/libraries", addLibraryItem);

// แสดงสินค้าที่ซื้อแล้วทั้งหมดของ user
router.get("/users/:userId/libraries", getUserLibraries);

// สินค้าที่ active ของ user (ขึ้นตาม productId)
router.get("/users/:userId/libraries/:productId/actives", getActiveLibraries);

// สินค้าที่ expired ของ user (เจาะ productId)
router.get("/users/:userId/libraries/:productId/expiries", getExpiredLibraries);

// อัปเดต Library item
router.patch("/users/libraries", updateLibraryItem);

// ลบ Library item
router.delete("/users/libraries", deleteLibraryItem);

export default router;
