import crypto from "crypto";
import User from "../db/models/user.js";
import { genHashedPassword } from "../utils/etc.js";
import { connectToMongoDB } from "../db/db.js";

const seedUsers = async () => {
  try {
    await connectToMongoDB();

    await User.deleteMany({});

    const users = [
      {
        nickname: "john",
        password: "password",
      },
      {
        nickname: "michael",
        password: "password",
      },
      {
        nickname: "sarah",
        password: "password",
      },
      {
        nickname: "chris",
        password: "password",
      },
    ];

    for (const userData of users) {
      const salt = crypto.randomBytes(16).toString("hex");
      const hashedPassword = genHashedPassword(userData.password, salt);

      const user = new User({
        nickname: userData.nickname,
        password: hashedPassword,
        salt: salt,
      });

      await user.save();
    }

    console.log("User seed data insertion complete");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting user seed data:", error);
    process.exit(1);
  }
};

seedUsers();
