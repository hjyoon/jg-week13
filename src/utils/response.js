import { NODE_ENV } from "../config/const.js";
import { CODE_0 } from "../config/detailCode.js";

export function buildResponse(codeObj, payload) {
  const res = { ...codeObj, ...payload };
  if (NODE_ENV === "production") {
    delete res.message;
  }
  return res;
}

export function noContent(res) {
  res.status(204).send();
}

export function resUnauthorized(res) {
  res.status(401).json(buildResponse(CODE_0, { message: "Unauthorized" }));
}

export function resForbidden(res) {
  res.status(403).json(buildResponse(CODE_0, { message: "Forbidden" }));
}

export function resNotFound(res) {
  res.status(404).json(buildResponse(CODE_0, { message: "Not Found" }));
}

export function resConflict(res) {
  res.status(409).json(buildResponse(CODE_0, { message: "Conflict" }));
}

export function resTooManyRequests(res) {
  res.status(429).json(buildResponse(CODE_0, { message: "Too Many Requests" }));
}

export function resServerError(res) {
  res.status(500).json(buildResponse(CODE_0, { message: "Server Error" }));
}

export function resNotImplemented(res) {
  res.status(501).json(buildResponse(CODE_0, { message: "Not Implemented" }));
}

export function resServiceUnavailable(res) {
  res
    .status(503)
    .json(buildResponse(CODE_0, { message: "Service Unavailable" }));
}
