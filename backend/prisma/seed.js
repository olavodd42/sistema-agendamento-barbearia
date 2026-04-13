import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const adminExists = await prisma.admin.findUnique({
    where: { email: "admin@teste.com" }
  });

  if (adminExists) {
    console.log("Admin já existe.");
    return;
  }

  await prisma.admin.create({
    data: {
      name: "Admin",
      email: "admin@teste.com",
      password: hashedPassword
    }
  });

  console.log("Admin criado com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });