import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config();


export const connectMongo = async () => {
    try {
        // Connect to MongoDB via Mongoose
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Mongo database ✅");
      } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
      }
}