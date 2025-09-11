import { Library } from "../../../models/Library.js";

/* POST: เพิ่ม purchased item (หลัง order confirmed) */
export const addLibraryItem = async (req, res) => {
  try {
    const newItem = new Library(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({
      message: "❌ Error adding library item",
      error: err.message,
    });
  }
};

/* GET: สินค้าที่ซื้อแล้วทั้งหมดของ user */
export const getUserLibraries = async (req, res) => {
  try {
    const { userId } = req.params;
    const libraries = await Library.find({ userId }).populate("productId");

    res.status(200).json({
      error: false,
      data: libraries,
      message: "🎉 All purchased items loaded",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "❌ Server error",
      details: err.message,
    });
  }
};

/* GET: สินค้าที่ active ของ user */
export const getActiveLibraries = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const activeItems = await Library.find({
      userId,
      productId,
      status: "active",
    }).populate("productId");

    res.status(200).json({
      error: false,
      data: activeItems,
      message: "✅ Active library items",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "❌ Error fetching active items",
      details: err.message,
    });
  }
};

/* GET: สินค้าที่ expired ของ user */
export const getExpiredLibraries = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const expiredItems = await Library.find({
      userId,
      productId,
      status: "expired",
    }).populate("productId");

    res.status(200).json({
      error: false,
      data: expiredItems,
      message: "⌛ Expired library items",
    });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "❌ Error fetching expired items",
      details: err.message,
    });
  }
};

/* PATCH: อัปเดต Library item */
export const updateLibraryItem = async (req, res) => {
  try {
    const { id } = req.body; // ใช้ body เพราะ route = /users/libraries
    const updatedItem = await Library.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(400).json({
      message: "❌ Error updating library item",
      error: err.message,
    });
  }
};

/* DELETE: ลบ Library item */
export const deleteLibraryItem = async (req, res) => {
  try {
    const { id } = req.body; // ใช้ body เพราะ route = /users/libraries
    await Library.findByIdAndDelete(id);
    res.status(200).json({ message: "Library item removed 🤖" });
  } catch (err) {
    res.status(400).json({
      message: "🤖 Error deleting library item",
      error: err.message,
    });
  }
};
