import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/db.js";
import { buildResponse, noContent, resNotFound } from "../utils/response.js";
import { CODE_1, CODE_3, CODE_4 } from "../config/detailCode.js";
import { checkToken } from "../middlewares/authorizer.js";

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res, next) => {
  const { post_id } = req.params;
  try {
    const db = getDb();
    const comments = await db
      .collection("comments")
      .aggregate([
        {
          $match: { post_id: new ObjectId(post_id) },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: "$author",
        },
        {
          $project: {
            _id: 1,
            content: 1,
            created_at: 1,
            "author._id": "$author._id",
            "author.nickname": "$author.nickname",
          },
        },
        {
          $sort: { created_at: -1 },
        },
      ])
      .toArray();
    res.status(200).json(buildResponse(CODE_1, { data: comments }));
  } catch (e) {
    next(e);
  }
});

router.post("/", checkToken, async (req, res, next) => {
  const { post_id } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json(CODE_3);
  }

  const user_id = req.locals.decodedToken.userId;

  try {
    const db = getDb();
    await db.collection("comments").insertOne({
      content,
      post_id: new ObjectId(post_id),
      user_id: new ObjectId(user_id),
      created_at: new Date(),
    });
    res.status(201).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.put("/:comment_id", checkToken, async (req, res, next) => {
  const { post_id, comment_id } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json(CODE_3);
  }

  const user_id = req.locals.decodedToken.userId;

  try {
    const db = getDb();
    const comment = await db.collection("comments").findOne({
      _id: new ObjectId(comment_id),
      post_id: new ObjectId(post_id),
    });
    if (!comment) {
      return resNotFound(res);
    }
    if (comment.user_id.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }
    await db
      .collection("comments")
      .updateOne(
        { _id: new ObjectId(comment_id), post_id: new ObjectId(post_id) },
        { $set: { content } }
      );
    res.status(200).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.delete("/:comment_id", checkToken, async (req, res, next) => {
  const { post_id, comment_id } = req.params;
  const user_id = req.locals.decodedToken.userId;
  try {
    const db = getDb();
    const comment = await db.collection("comments").findOne({
      _id: new ObjectId(comment_id),
      post_id: new ObjectId(post_id),
    });
    if (!comment) {
      return resNotFound(res);
    }
    if (comment.user_id.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }
    await db.collection("comments").deleteOne({
      _id: new ObjectId(comment_id),
      post_id: new ObjectId(post_id),
    });
    noContent(res);
  } catch (e) {
    next(e);
  }
});

export default router;
