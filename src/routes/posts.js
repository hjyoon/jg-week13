import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/db.js";
import { buildResponse, noContent, resNotFound } from "../utils/response.js";
import { CODE_1, CODE_3, CODE_4 } from "../config/detailCode.js";
import { checkToken } from "../middlewares/authorizer.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const db = getDb();
    const posts = await db
      .collection("posts")
      .aggregate([
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
            title: 1,
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
    res.status(200).json(buildResponse(CODE_1, { data: posts }));
  } catch (e) {
    next(e);
  }
});

router.post("/", checkToken, async (req, res, next) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json(CODE_3);
  }

  const user_id = req.locals.decodedToken.userId;

  try {
    const db = getDb();
    await db.collection("posts").insertOne({
      title,
      content,
      user_id: new ObjectId(user_id),
      created_at: new Date(),
    });
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
      .aggregate([
        {
          $match: { _id: new ObjectId(post_id) },
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
            title: 1,
            content: 1,
            created_at: 1,
            "author._id": "$author._id",
            "author.nickname": "$author.nickname",
          },
        },
      ])
      .next();
    if (!post) {
      return resNotFound(res);
    }
    res.status(200).json(buildResponse(CODE_1, { data: post }));
  } catch (e) {
    next(e);
  }
});

router.put("/:post_id", checkToken, async (req, res, next) => {
  const { post_id } = req.params;
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json(CODE_3);
  }

  const user_id = req.locals.decodedToken.userId;

  try {
    const db = getDb();
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(post_id) });
    if (!post) {
      return resNotFound(res);
    }
    if (post.user_id.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }
    await db
      .collection("posts")
      .updateOne({ _id: new ObjectId(post_id) }, { $set: { title, content } });
    res.status(200).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.delete("/:post_id", checkToken, async (req, res, next) => {
  const { post_id } = req.params;
  const user_id = req.locals.decodedToken.userId;
  try {
    const db = getDb();
    const post = await db
      .collection("posts")
      .findOne({ _id: new ObjectId(post_id) });
    if (!post) {
      return resNotFound(res);
    }
    if (post.user_id.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }
    await db.collection("posts").deleteOne({ _id: new ObjectId(post_id) });
    noContent(res);
  } catch (e) {
    next(e);
  }
});

export default router;
