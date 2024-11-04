import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { JWT_SECRET, EXPIRES_IN } from "../config/const.js";

export function genHashedPassword(password, salt) {
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha256")
    .toString(`hex`);
  return passwordHash;
}

export function genToken(userId) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: EXPIRES_IN,
  });

  return accessToken;
}
