import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import express from "express";
import { getDb } from "../db/db.js";
import { EXPIRES_IN, JWT_SECRET, NODE_ENV } from "../config/const.js";
import { CODE_1, CODE_3, CODE_4 } from "../config/detailCode.js";
import { buildResponse } from "../utils/response.js";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  const { nickname, password, confirmPassword } = req.body;

  if (!nickname || !password || !confirmPassword) {
    return res.status(400).json(CODE_3);
  }

  const nicknameRegex = /^[a-zA-Z0-9]{3,}$/;
  if (!nicknameRegex.test(nickname)) {
    return res.status(400).json(CODE_3);
  }

  if (password.length < 4 || password.includes(nickname)) {
    return res.status(400).json(CODE_3);
  }

  if (password !== confirmPassword) {
    return res.status(400).json(CODE_3);
  }

  try {
    const db = await getDb();

    const existingUser = await db.collection("users").findOne({ nickname });
    if (existingUser) {
      return res.status(400).json({ message: "This is a duplicate nickname" });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, `sha256`)
      .toString(`hex`);
    await db
      .collection("users")
      .insertOne({ nickname, password: passwordHash, salt });

    res.status(201).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json(CODE_3);
  }

  try {
    const db = await getDb();

    const user = await db.collection("users").findOne({ nickname });
    if (!user) {
      return res.status(400).json(CODE_4);
    }

    const salt = user.salt;
    const passwordHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha256")
      .toString(`hex`);
    if (passwordHash !== user.password) {
      return res.status(400).json(CODE_4);
    }

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: EXPIRES_IN,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: NODE_ENV === "production" ? true : false,
      maxAge: EXPIRES_IN,
    });
    res.status(200).json(
      buildResponse(CODE_1, {
        data: { tokenType: "Bearer", expiresIn: EXPIRES_IN, accessToken },
      })
    );
  } catch (e) {
    next(e);
  }
});

export default router;