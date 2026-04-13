/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mantemos o React Compiler desativado por padrão para evitar consumo
  // excessivo de CPU/memória em máquinas mais fracas durante o desenvolvimento.
  reactCompiler: process.env.NEXT_USE_REACT_COMPILER === "1",
};

export default nextConfig;
