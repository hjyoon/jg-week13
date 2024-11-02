import express from "express";
import cors from "cors";
import morgan from "morgan";
import {
  buildResponse,
  noContent,
  resForbidden,
  resNotFound,
  resServerError,
} from "./utils/response.js";
import { httpConfig } from "./config/var.js";
import { checkMongoDBConnection, getDb } from "./db/db.js";
import { CODE_1, CODE_3 } from "./config/detailCode.js";
import { ObjectId } from "mongodb";

const app = express();

app.use((req, res, next) => {
  if (httpConfig.isDisableKeepAlive) {
    console.error("Server is shutting down. Setting 'Connection: close'");
    res.set("Connection", "close");
  }
  next();
});

app.set("trust proxy", true);

app.use(morgan("combined"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/liveness", (req, res) => {
  res.send("Service is up");
});

app.get("/readiness", async (req, res) => {
  const isMongoDBConnected = await checkMongoDBConnection();
  if (isMongoDBConnected) {
    res.send("Service is ready");
  } else {
    resServiceUnavailable(res);
  }
});

app.get("/api/posts", async (req, res, next) => {
  try {
    const db = getDb();
    const posts = await db
      .collection("posts")
      .find()
      .sort({ created_at: -1 })
      .toArray();
    res.status(200).json(buildResponse(CODE_1, { data: posts }));
  } catch (e) {
    next();
  }
});

app.post("/api/posts", async (req, res, next) => {
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
    next();
  }
});

app.get("/api/posts/:post_id", async (req, res, next) => {
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
    next();
  }
});

app.put("/api/posts/:post_id", async (req, res, next) => {
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
    next();
  }
});

app.delete("/api/posts/:post_id", async (req, res, next) => {
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
    next();
  }
});

app.get("/api/posts/:post_id/comments", async (req, res, next) => {
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
    next();
  }
});

app.post("/api/posts/:post_id/comments", async (req, res, next) => {
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
    next();
  }
});

app.put("/api/posts/:post_id/comments/:comment_id", async (req, res, next) => {
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
    next();
  }
});

app.delete(
  "/api/posts/:post_id/comments/:comment_id",
  async (req, res, next) => {
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
      next();
    }
  }
);

app.use((req, res, next) => {
  resNotFound(res);
});

app.use((err, req, res, next) => {
  console.error(err);
  resServerError(res);
});

export default app;
