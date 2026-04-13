import "dotenv/config";

function readEnv(name, fallback) {
  const value = process.env[name];

  if (value === undefined || value === null || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

function parsePort(rawPort) {
  const parsedPort = Number(rawPort);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error("A variável PORT deve ser um número inteiro entre 1 e 65535.");
  }

  return parsedPort;
}

const NODE_ENV = readEnv("NODE_ENV", "development");
const JWT_SECRET = readEnv("JWT_SECRET");
const PORT = parsePort(readEnv("PORT", "3333"));

if (NODE_ENV === "production" && JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET fraco para produção. Use ao menos 32 caracteres.");
}

if (NODE_ENV !== "production" && JWT_SECRET.length < 12) {
  console.warn("[env] JWT_SECRET curto para desenvolvimento. Considere usar um valor mais forte.");
}

const rawCorsOrigin = readEnv("CORS_ORIGIN", "*");

const CORS_ORIGIN = rawCorsOrigin === "*"
  ? "*"
  : rawCorsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export const env = Object.freeze({
  NODE_ENV,
  PORT,
  JWT_SECRET,
  CORS_ORIGIN
});
