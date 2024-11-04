import crypto from "node:crypto";
import express from "express";
import Joi from "joi";
import User from "../db/models/user.js";
import { EXPIRES_IN, NODE_ENV } from "../config/const.js";
import { CODE_1, CODE_3, CODE_4 } from "../config/detailCode.js";
import { buildResponse } from "../utils/response.js";
import { genHashedPassword, genToken } from "../utils/etc.js";

const router = express.Router();

const registerSchema = Joi.object({
  nickname: Joi.string().alphanum().min(3).required(),
  password: Joi.string().min(4).disallow(Joi.ref("nickname")).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
});

const loginSchema = Joi.object({
  nickname: Joi.string().required(),
  password: Joi.string().required(),
});

router.post("/register", async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json(CODE_3);
  }

  const { nickname, password } = req.body;

  try {
    const existingUser = await User.findOne({ nickname });
    if (existingUser) {
      return res.status(400).json({ message: "This is a duplicate nickname" });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = genHashedPassword(password, salt);

    const newUser = new User({
      nickname,
      password: passwordHash,
      salt,
      created_at: new Date(),
    });
    await newUser.save();

    res.status(201).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json(CODE_3);
  }

  const { nickname, password } = req.body;

  try {
    const user = await User.findOne({ nickname });
    if (!user) {
      return res.status(400).json(CODE_4);
    }

    const passwordHash = genHashedPassword(password, user.salt);
    if (passwordHash !== user.password) {
      return res.status(400).json(CODE_4);
    }

    const accessToken = genToken(user._id);

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
