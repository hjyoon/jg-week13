import { connectToMongoDB } from "../db/db.js";
import Comment from "../db/models/comment.js";
import Post from "../db/models/post.js";
import User from "../db/models/user.js";

const seedComments = async () => {
  try {
    await connectToMongoDB();

    await Comment.deleteMany({});

    const testUser = await User.findOne({ nickname: "john", deleted_at: null });
    if (!testUser) {
      throw new Error(
        "Author user not found. Please run the user seed script first."
      );
    }

    const posts = await Post.find({ deleted_at: null });
    if (posts.length === 0) {
      throw new Error("Post not found. Please insert post seed data first.");
    }

    const comments = [
      {
        content: "Thanks for the great post!",
        post: posts[0]._id,
        author: testUser._id,
      },
      {
        content: "That's useful information.",
        post: posts[1]._id,
        author: testUser._id,
      },
    ];

    for (const commentData of comments) {
      const comment = new Comment(commentData);
      await comment.save();
    }

    console.log("Comment seed data insertion complete");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting comment seed data:", error);
    process.exit(1);
  }
};

seedComments();
