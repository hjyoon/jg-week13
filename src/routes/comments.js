import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/db.js";
import { buildResponse, noContent, resNotFound } from "../utils/response.js";
import { CODE_1, CODE_3 } from "../config/detailCode.js";

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res, next) => {
  const { post_id } = req.params;
  try {
    const db = getDb();
    const comments = await db
      .collection("comments")
      .find({ post_id })
      .sort({ created_at: -1 })
      .toArray();
    res.status(200).json(buildResponse(CODE_1, { data: comments }));
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  const { post_id } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json(CODE_3);
  }

  try {
    const db = getDb();
    await db
      .collection("comments")
      .insertOne({ post_id, content, created_at: new Date() });
    res.status(201).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.put("/:comment_id", async (req, res, next) => {
  const { post_id, comment_id } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json(CODE_3);
  }

  try {
    const db = getDb();
    const comment = await db
      .collection("comments")
      .updateOne(
        { _id: new ObjectId(comment_id), post_id },
        { $set: { content } }
      );
    if (!comment) {
      return resNotFound(res);
    }
    res.status(200).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.delete("/:comment_id", async (req, res, next) => {
  const { post_id, comment_id } = req.params;

  try {
    const db = getDb();
    const comment = await db
      .collection("comments")
      .deleteOne({ _id: new ObjectId(comment_id), post_id });
    if (!comment) {
      return resNotFound(res);
    }
    noContent(res);
  } catch (e) {
    next(e);
  }
});

export default router;
