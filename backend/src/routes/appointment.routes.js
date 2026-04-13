import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

function generateSlots(startHour = 9, endHour = 18, interval = 30) {
  const slots = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }

  return slots;
}

function combineDateAndTime(date, time) {
  return new Date(`${date}T${time}:00`);
}

function getDayRange(date) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);
  return { start, end };
}

/**
 * GET /appointments/available?date=2026-04-12
 * rota pública
 */
router.get("/available", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "A data é obrigatória." });
    }

    const { start, end } = getDayRange(date);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        },
        status: {
          not: "CANCELED"
        }
      },
      orderBy: {
        date: "asc"
      }
    });

    const occupiedSlots = appointments.map((appointment) => {
      const hours = String(appointment.date.getHours()).padStart(2, "0");
      const minutes = String(appointment.date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    });

    const allSlots = generateSlots(9, 18, 30);

    const availableSlots = allSlots.filter(
      (slot) => !occupiedSlots.includes(slot)
    );

    return res.json(availableSlots);
  } catch {
    return res.status(500).json({ message: "Erro ao buscar horários." });
  }
});

/**
 * POST /appointments
 * rota pública
 */
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, date, time, notes } = req.body;

    if (!name || !phone || !date || !time) {
      return res.status(400).json({
        message: "Nome, telefone, data e horário são obrigatórios."
      });
    }

    const appointmentDate = combineDateAndTime(date, time);

    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: "Data ou horário inválidos." });
    }

    const customer = await prisma.customer.upsert({
      where: {
        phone
      },
      update: {
        name,
        email
      },
      create: {
        name,
        phone,
        email
      }
    });

    const appointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        date: appointmentDate,
        notes
      },
      include: {
        customer: true
      }
    });

    return res.status(201).json(appointment);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Esse horário já foi reservado." });
    }

    return res.status(500).json({ message: "Erro ao criar agendamento." });
  }
});

/**
 * Daqui para baixo é admin
 */
router.use(authMiddleware);

/**
 * GET /appointments?date=2026-04-12
 */
router.get("/", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "A data é obrigatória." });
    }

    const { start, end } = getDayRange(date);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      include: {
        customer: true
      },
      orderBy: {
        date: "asc"
      }
    });

    return res.json(appointments);
  } catch {
    return res.status(500).json({ message: "Erro ao listar agendamentos." });
  }
});

/**
 * PATCH /appointments/:id/status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = ["SCHEDULED", "DONE", "CANCELED"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    return res.json(appointment);
  } catch {
    return res.status(500).json({ message: "Erro ao atualizar status." });
  }
});

export default router;