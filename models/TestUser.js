import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const TestUserSchema = new Schema({
  fullName: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
}, {
    timestamps: true
});

// Hash password before saving
TestUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const TestUser = model("TestUser", TestUserSchema);