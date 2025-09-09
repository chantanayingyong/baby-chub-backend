import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TestUser } from "../../../models/TestUser.js";



export const getAllTestUsers = async (req, res) => {
  try {
    // exclude passwords in the result
    const users = await TestUser.find().select("-password").sort("-createdAt");
    res.json({ error: false, users });
  } catch (err) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch users",
      details: err.message,
    });
  }
};

export const testSignUp = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" });
  }

  try {
    const existingUser = await TestUser.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: true, message: "Email already in use" });
    }

    const user = new TestUser({ fullName, email, password });
    await user.save();

    res
      .status(201)
      .json({ error: false, message: "User registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
};

export const testLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "Email and password are required" });
  }

  try {
    const user = await TestUser.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // 1 hour expiration
    });

    const isProd = process.env.NODE_ENV === "production";

    // Set token in HttpOnly cookie
    // res.cookie("accessToken", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "Strict", // helps prevent CSRF
    //   path: "/",
    //   maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    // });
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd, // only send over HTTPS in prod
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({
      error: false,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        fullName: user.fullName,
      }, // send some safe public info if needed
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: true, message: "Server error", details: err.message });
  }
};

export const getTestUserProfile = async (req, res) => {
  const user = await TestUser.findById(req.user.user._id).select("-password"); // exclude password
  if (!user) {
    return res.status(404).json({ error: true, message: "User not found" });
  }

  res.status(200).json({ error: false, user });
};

export const testLogout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

