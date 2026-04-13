import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";

function mapPrismaKnownError(error) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  if (error.code === "P2002") {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(", ")
      : "campo único";

    return {
      statusCode: 409,
      message: `Já existe um registro com o mesmo valor para: ${target}.`
    };
  }

  if (error.code === "P2025") {
    return {
      statusCode: 404,
      message: "Registro não encontrado."
    };
  }

  return null;
}

export function notFoundHandler(req, _res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(error, req, res, _next) {
  const requestId = req.id ?? "unknown";

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      })),
      requestId
    });
  }

  const prismaMappedError = mapPrismaKnownError(error);

  if (prismaMappedError) {
    return res.status(prismaMappedError.statusCode).json({
      message: prismaMappedError.message,
      requestId
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
      requestId
    });
  }

  console.error(`[${requestId}]`, error);

  return res.status(500).json({
    message: "Erro interno do servidor.",
    requestId
  });
}
