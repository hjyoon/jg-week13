import express from "express";
import { ObjectId } from "mongodb";
import Joi from "joi";
import Post from "../db/models/post.js";
import { buildResponse, noContent, resNotFound } from "../utils/response.js";
import { CODE_1, CODE_3, CODE_4 } from "../config/detailCode.js";
import { checkToken } from "../middlewares/authorizer.js";

const router = express.Router();

const postSchema = Joi.object({
  title: Joi.string().min(1).required(),
  content: Joi.string().min(1).required(),
});

const postIdSchema = Joi.object({
  post_id: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) {
      return helpers.message("Invalid post ID format");
    }
    return value;
  }, "ObjectId Validation"),
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find({ deleted_at: null })
      .populate("author", "nickname")
      .sort({ created_at: -1 })
      .select("title content created_at");
    res.status(200).json(buildResponse(CODE_1, { data: posts }));
  } catch (e) {
    next(e);
  }
});

router.post("/", checkToken, async (req, res, next) => {
  const { error } = postSchema.validate(req.body);
  if (error) {
    return res.status(400).json(CODE_3);
  }

  const { title, content } = req.body;
  const user_id = req.locals.decodedToken.userId;

  try {
    const post = new Post({
      title,
      content,
      author: user_id,
    });
    await post.save();
    await post.populate("author", "nickname");
    res.status(201).json(
      buildResponse(CODE_1, {
        data: {
          _id: post._id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          updated_at: post.updated_at,
          author: post.author,
        },
      })
    );
  } catch (e) {
    next(e);
  }
});

router.get("/:post_id", async (req, res, next) => {
  const { error } = postIdSchema.validate(req.params);
  if (error) {
    return res.status(400).json(CODE_3);
  }

  const { post_id } = req.params;

  try {
    const post = await Post.findOne({ _id: post_id, deleted_at: null })
      .populate("author", "nickname")
      .select("title content created_at");
    if (!post) {
      return resNotFound(res);
    }
    res.status(200).json(buildResponse(CODE_1, { data: post }));
  } catch (e) {
    next(e);
  }
});

router.put("/:post_id", checkToken, async (req, res, next) => {
  const { error: paramError } = postIdSchema.validate(req.params);
  const { error: bodyError } = postSchema.validate(req.body);

  if (paramError) {
    return res.status(400).json(CODE_3);
  }

  if (bodyError) {
    return res.status(400).json(CODE_3);
  }

  const { post_id } = req.params;
  const { title, content } = req.body;
  const user_id = req.locals.decodedToken.userId;

  try {
    const post = await Post.findOne({ _id: post_id, deleted_at: null });
    if (!post) {
      return resNotFound(res);
    }

    if (post.author.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }

    post.title = title;
    post.content = content;
    await post.save();
    res.status(200).json(
      buildResponse(CODE_1, {
        data: {
          _id: post._id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          updated_at: post.updated_at,
          author: post.author,
        },
      })
    );
  } catch (e) {
    next(e);
  }
});

router.delete("/:post_id", checkToken, async (req, res, next) => {
  const { error } = postIdSchema.validate(req.params);
  if (error) {
    return res.status(400).json(CODE_3);
  }

  const { post_id } = req.params;
  const user_id = req.locals.decodedToken.userId;

  try {
    const post = await Post.findOne({ _id: post_id, deleted_at: null });
    if (!post) {
      return resNotFound(res);
    }

    if (post.author.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }

    post.deleted_at = Date.now();
    await post.save();
    noContent(res);
  } catch (e) {
    next(e);
  }
});

export default router;
