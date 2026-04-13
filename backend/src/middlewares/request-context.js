import { randomUUID } from "node:crypto";

export function requestContext(req, res, next) {
  const requestId = typeof req.headers["x-request-id"] === "string"
    ? req.headers["x-request-id"]
    : randomUUID();

  req.id = requestId;
  res.setHeader("x-request-id", requestId);

  next();
}
