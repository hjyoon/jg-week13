import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

postSchema.pre("save", function (next) {
  if (this.isModified() && !this.deleted_at) {
    this.updated_at = Date.now();
  }
  next();
});

export default mongoose.model("Post", postSchema);
