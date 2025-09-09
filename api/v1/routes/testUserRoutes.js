import express from "express";
import { testSignUp, getAllTestUsers, testLogin, getTestUserProfile, testLogout } from "../controllers/testUsersController.js";
import { authUser } from "../../../middleware/auth.js";


const router = express.Router();

// ✅ No auth required
// GET all users
router.get("/users", getAllTestUsers);

// Register a new user
router.post("/auth/signup", testSignUp);

// Login a user - jwt signed token
router.post("/auth/login", testLogin);

// GET Current User Profile (protected route)
router.get("/auth/profile", authUser, getTestUserProfile);

// LOGOUT
router.post("/auth/logout", testLogout);

export default router;