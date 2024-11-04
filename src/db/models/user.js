import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
