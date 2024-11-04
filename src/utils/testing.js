import { NODE_ENV } from "../config/const.js";
import Comment from "../db/models/comment.js";
import Post from "../db/models/post.js";
import User from "../db/models/user.js";

export async function initTest() {
  if (NODE_ENV !== "test") {
    exit(1);
  }

  try {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log("Data reset complete");
  } catch (e) {
    console.error("Error resetting data:", error);
    exit(1);
  }
}
