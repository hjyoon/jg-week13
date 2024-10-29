import http from "node:http";
import app from "./src/app.js";
import { APP_PORT } from "./src/config/const.js";
import { httpConfig } from "./src/config/var.js";

const server = http.createServer(app);

server.listen(APP_PORT, () => {
  const addr = server.address();
  if (addr === null) {
    process.exit();
  }

  if (typeof addr === "string") {
    console.log("Listening on", addr);
  } else {
    console.log("Listening on port", addr.port);
  }

  if (process.send) {
    process.send("ready");
  }
});

function gracefulShutdown(signal) {
  console.log(`${signal} received, starting shutdown process`);
  httpConfig.isDisableKeepAlive = true;
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default server;
