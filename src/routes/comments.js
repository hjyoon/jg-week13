import express from "express";
import { ObjectId } from "mongodb";
import Joi from "joi";
import Comment from "../db/models/comment.js";
import { buildResponse, noContent, resNotFound } from "../utils/response.js";
import { CODE_1, CODE_3, CODE_4 } from "../config/detailCode.js";
import { checkToken } from "../middlewares/authorizer.js";

const router = express.Router({ mergeParams: true });

const contentSchema = Joi.object({
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

const commentIdSchema = Joi.object({
  comment_id: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) {
      return helpers.message("Invalid comment ID format");
    }
    return value;
  }, "ObjectId Validation"),
});

router.get("/", async (req, res, next) => {
  const { error } = postIdSchema.validate(req.params);
  if (error) {
    return res.status(400).json(CODE_3);
  }

  const { post_id } = req.params;

  try {
    const comments = await Comment.find({ post_id })
      .populate("user_id", "nickname")
      .sort({ created_at: -1 })
      .select("content created_at user_id");
    res.status(200).json(buildResponse(CODE_1, { data: comments }));
  } catch (e) {
    next(e);
  }
});

router.post("/", checkToken, async (req, res, next) => {
  const { post_id } = req.params;
  const { error: paramError } = postIdSchema.validate(req.params);
  const { error: bodyError } = contentSchema.validate(req.body);

  if (paramError) {
    return res.status(400).json(CODE_3);
  }

  if (bodyError) {
    return res.status(400).json(CODE_3);
  }

  const { content } = req.body;
  const user_id = req.locals.decodedToken.userId;

  try {
    const comment = new Comment({
      content,
      post_id,
      user_id,
      created_at: new Date(),
    });
    await comment.save();
    res.status(201).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.put("/:comment_id", checkToken, async (req, res, next) => {
  const { post_id, comment_id } = req.params;
  const { error: postIdError } = postIdSchema.validate({ post_id });
  const { error: commentIdError } = commentIdSchema.validate({ comment_id });
  const { error: bodyError } = contentSchema.validate(req.body);

  if (postIdError) {
    return res.status(400).json(CODE_3);
  }

  if (commentIdError) {
    return res.status(400).json(CODE_3);
  }

  if (bodyError) {
    return res.status(400).json(CODE_3);
  }

  const { content } = req.body;
  const user_id = req.locals.decodedToken.userId;

  try {
    const comment = await Comment.findOne({ _id: comment_id, post_id });
    if (!comment) {
      return resNotFound(res);
    }
    if (comment.user_id.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }
    comment.content = content;
    await comment.save();
    res.status(200).json(CODE_1);
  } catch (e) {
    next(e);
  }
});

router.delete("/:comment_id", checkToken, async (req, res, next) => {
  const { post_id, comment_id } = req.params;
  const { error: postIdError } = postIdSchema.validate({ post_id });
  const { error: commentIdError } = commentIdSchema.validate({ comment_id });

  if (postIdError) {
    return res.status(400).json(CODE_3);
  }

  if (commentIdError) {
    return res.status(400).json(CODE_3);
  }

  const user_id = req.locals.decodedToken.userId;

  try {
    const comment = await Comment.findOne({ _id: comment_id, post_id });
    if (!comment) {
      return resNotFound(res);
    }

    if (comment.user_id.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }

    await Comment.deleteOne({ _id: comment_id, post_id });
    noContent(res);
  } catch (e) {
    next(e);
  }
});

export default router;
