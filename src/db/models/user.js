import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salt: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

userSchema.pre("save", function (next) {
  if (this.isModified()) {
    this.updated_at = Date.now();
  }
  next();
});

export default mongoose.model("User", userSchema);
