import { MongoClient } from "mongodb";
import { MONGO_URI } from "../config/const.js";

let client;

export async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
  }

  try {
    await client.connect();
    console.log("MongoDB Native Driver connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export async function closeMongoDB() {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

export async function checkMongoDBConnection() {
  try {
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch (error) {
    console.error("MongoDB readiness check failed:", error);
    return false;
  }
}
