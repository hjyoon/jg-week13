import jwt from "jsonwebtoken";
import { CODE_4 } from "../config/detailCode.js";
import { JWT_SECRET } from "../config/const.js";

export function checkToken(req, res, next) {
  const token =
    req.headers?.authorization?.split("Bearer ")[1] || req.cookies?.accessToken;

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.locals = { ...req.locals, token, decodedToken };
    next();
  } catch (e) {
    res.status(401).json(CODE_4);
  }
}
