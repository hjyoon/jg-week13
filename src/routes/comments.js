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
    const comments = await Comment.find({ post: post_id, deleted_at: null })
      .populate("author", "nickname")
      .populate("post", "_id")
      .sort({ created_at: -1 })
      .select("content created_at");
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
      post: post_id,
      author: user_id,
    });
    await comment.save();
    await comment.populate("author", "nickname");
    await comment.populate("post", "_id");
    res.status(201).json(
      buildResponse(CODE_1, {
        data: {
          _id: comment._id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          author: comment.author,
          post: comment.post,
        },
      })
    );
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
    const comment = await Comment.findOne({
      _id: comment_id,
      post: post_id,
      deleted_at: null,
    });
    if (!comment) {
      return resNotFound(res);
    }
    if (comment.author.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }
    comment.content = content;
    await comment.save();
    res.status(200).json(
      buildResponse(CODE_1, {
        data: {
          _id: comment._id,
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          author: comment.author,
          post: comment.post,
        },
      })
    );
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
    const comment = await Comment.findOne({
      _id: comment_id,
      post: post_id,
      deleted_at: null,
    });
    if (!comment) {
      return resNotFound(res);
    }

    if (comment.author.toString() !== user_id) {
      return res.status(403).json(CODE_4);
    }

    comment.deleted_at = Date.now();
    await comment.save();
    noContent(res);
  } catch (e) {
    next(e);
  }
});

export default router;
