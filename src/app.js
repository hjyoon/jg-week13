import express from "express";
import cors from "cors";
import morgan from "morgan";
import { resNotFound, resServerError } from "./utils/response.js";
import { httpConfig } from "./config/var.js";
import { checkMongoDBConnection } from "./db/db.js";
import postRouter from "./routes/posts.js";
import commentRouter from "./routes/comments.js";
import authRouter from "./routes/auth.js";

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

app.use("/api/posts", postRouter);
app.use("/api/posts/:post_id/comments", commentRouter);
app.use("/api/auth", authRouter);

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

app.use((req, res, next) => {
  resNotFound(res);
});

app.use((err, req, res, next) => {
  console.error(err);
  resServerError(res);
});

export default app;
