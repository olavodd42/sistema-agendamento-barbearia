import app from "./app.js";
import prisma from "./lib/prisma.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`Servidor rodando em http://localhost:${env.PORT}`);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`[shutdown] Sinal recebido: ${signal}. Encerrando aplicação...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("[shutdown] Conexão com banco encerrada.");
      process.exit(0);
    } catch (error) {
      console.error("[shutdown] Falha ao encerrar recursos:", error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("[shutdown] Encerramento forçado por timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[uncaughtException]", error);
  void shutdown("uncaughtException");
});