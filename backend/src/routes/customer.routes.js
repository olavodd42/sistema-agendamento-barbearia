import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json(customers);
  } catch {
    return res.status(500).json({ message: "Erro ao buscar clientes." });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Nome e telefone são obrigatórios." });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email
      }
    });

    return res.status(201).json(customer);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar cliente." });
  }
});

export default router;