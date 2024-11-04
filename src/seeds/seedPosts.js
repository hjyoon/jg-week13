import Post from "../db/models/post.js";
import User from "../db/models/user.js";
import { connectToMongoDB } from "../db/db.js";

const seedPosts = async () => {
  try {
    await connectToMongoDB();

    await Post.deleteMany({});

    const testUser = await User.findOne({ nickname: "john", deleted_at: null });
    if (!testUser) {
      throw new Error(
        "Author user not found. Please run the user seed script first."
      );
    }

    const posts = [
      {
        title: "First Post",
        content: "This is the content of the first post.",
        author: testUser._id,
      },
      {
        title: "Second Post",
        content: "This is the content of the second post.",
        author: testUser._id,
      },
    ];

    for (const postData of posts) {
      const post = new Post(postData);
      await post.save();
    }

    console.log("Post seed data insertion complete");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting post seed data:", error);
    process.exit(1);
  }
};

seedPosts();
