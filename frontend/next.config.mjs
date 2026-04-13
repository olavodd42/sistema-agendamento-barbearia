import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mantemos o React Compiler desativado por padrão para evitar consumo
  // excessivo de CPU/memória em máquinas mais fracas durante o desenvolvimento.
  reactCompiler: process.env.NEXT_USE_REACT_COMPILER === "1",
  // Define explicitamente a raiz de tracing para evitar ambiguidades
  // quando há múltiplos lockfiles no workspace.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
