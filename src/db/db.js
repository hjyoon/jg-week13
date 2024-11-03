import mongoose from "mongoose";
import { MONGO_URI } from "../config/const.js";

export async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Mongoose connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export async function closeMongoDB() {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}

export async function checkMongoDBConnection() {
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error("MongoDB readiness check failed:", error);
    return false;
  }
}
