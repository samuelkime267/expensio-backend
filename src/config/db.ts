import mongoose from "mongoose";
import { MONGO_URL } from "../config/env";
import { insertDefaultCategories } from "@/utils";

export const connectDb = async (cb: () => void) => {
  try {
    await mongoose.connect(MONGO_URL);
    insertDefaultCategories(false);
    console.log("Database connected successfully");
    cb();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
