import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createCustomerSchema } from "../validation/schemas.js";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return res.json(customers);
});

router.post("/", authMiddleware, validate(createCustomerSchema), async (req, res) => {
  const { name, phone, email } = req.body;

  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      email
    }
  });

  return res.status(201).json(customer);
});

export default router;