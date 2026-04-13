import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não enviado." });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({ message: "Token inválido." });
  }

  const [scheme, token] = parts;

  if (!token || !/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: "Formato inválido." });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded?.adminId) {
      return res.status(401).json({ message: "Token inválido." });
    }

    req.adminId = decoded.adminId;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}