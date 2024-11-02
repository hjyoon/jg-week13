import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/db.js";
import {
  buildResponse,
  noContent,
  resForbidden,
  resNotFound,
} from "../utils/response.js";
import { CODE_1, CODE_3 } from "../config/detailCode.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const db = getDb();
    const posts = await db
      .collection("posts")
      .find()
      .sort({ created_at: -1 })
      .toArray();
    res.status(200).json(buildResponse(CODE_1, { data: posts }));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  const { title, author, password, content } = req.body;
  if (!title || !author || !password || !content) {
    return res.status(400).json(CODE_3);
  }

  try {
    const db = getDb();
    await db
      .collection("posts")
      .insertOne({ title, author, password, content, created_at: new Date() });
    res.status(201).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.get("/:post_id", async (req, res, next) => {
  const { post_id } = req.params;
  try {
    const db = getDb();
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(post_id) });
    if (!post) {
      return resNotFound(res);
    }
    res.status(200).json(buildResponse(CODE_1, { data: post }));
  } catch (e) {
    next(e);
  }
});

router.put("/:post_id", async (req, res, next) => {
  const { post_id } = req.params;
  const { password, title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json(CODE_3);
  }
  try {
    const db = getDb();
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(post_id) });
    if (!post) {
      return resNotFound(res);
    }
    if (post.password !== password) {
      return resNotFound(res);
    }
    await db
      .collection("posts")
      .updateOne({ _id: new ObjectId(post_id) }, { $set: { title, content } });
    res.status(200).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.delete("/:post_id", async (req, res, next) => {
  const { post_id } = req.params;
  const { password } = req.body;
  try {
    const db = getDb();
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(post_id) });
    if (!post) {
      return resNotFound(res);
    }
    if (post.password !== password) {
      return resForbidden();
    }
    await db.collection("posts").deleteOne({ _id: new ObjectId(post_id) });
    noContent(res);
  } catch (e) {
    next(e);
  }
});

export default router;
