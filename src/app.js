import express from "express";
import cors from "cors";
import morgan from "morgan";
import { resNotFound, resServerError } from "./utils/response.js";
import { logError } from "./utils/logger.js";
import { httpConfig } from "./config/var.js";

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

app.get("/readiness", (req, res) => {
  res.send("Service is ready");
});

app.use((req, res, next) => {
  resNotFound(res);
});

app.use((err, req, res, next) => {
  logError(err);
  resServerError(res);
});

export default app;
