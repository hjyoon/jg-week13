import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

commentSchema.pre("save", function (next) {
  if (this.isModified() && !this.deleted_at) {
    this.updated_at = Date.now();
  }
  next();
});

export default mongoose.model("Comment", commentSchema);
