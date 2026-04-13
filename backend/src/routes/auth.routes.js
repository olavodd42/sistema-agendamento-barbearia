import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema } from "../validation/schemas.js";
import { AppError } from "../errors/app-error.js";
import { env } from "../config/env.js";

const router = Router();

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: "Muitas tentativas de login. Tente novamente em alguns minutos."
    });
  }
});

router.post("/login", loginRateLimit, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!admin) {
    throw new AppError("Email ou senha inválidos.", 401);
  }

  const passwordMatch = await bcrypt.compare(password, admin.password);

  if (!passwordMatch) {
    throw new AppError("Email ou senha inválidos.", 401);
  }

  const token = jwt.sign(
    { adminId: admin.id },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email
    }
  });
});

router.get("/me", authMiddleware, async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.adminId },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  if (!admin) {
    throw new AppError("Administrador não encontrado.", 404);
  }

  return res.json(admin);
});

export default router;