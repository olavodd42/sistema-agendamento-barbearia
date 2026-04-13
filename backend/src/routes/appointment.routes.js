import { Router } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  createAppointmentSchema,
  dateQuerySchema,
  updateAppointmentStatusSchema,
  cuidParamSchema
} from "../validation/schemas.js";
import { AppError } from "../errors/app-error.js";

const router = Router();

const START_HOUR = 9;
const END_HOUR = 18;
const INTERVAL_MINUTES = 30;

const createAppointmentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: "Muitas tentativas de agendamento. Tente novamente em alguns minutos."
    });
  }
});

function generateSlots(startHour = START_HOUR, endHour = END_HOUR, interval = INTERVAL_MINUTES) {
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

function isDateStringValid(dateString) {
  const parsed = new Date(`${dateString}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function isTimeWithinBusinessHours(time) {
  const [hour, minute] = time.split(":").map(Number);
  const valueInMinutes = (hour * 60) + minute;
  const startInMinutes = START_HOUR * 60;
  const endInMinutes = END_HOUR * 60;

  return valueInMinutes >= startInMinutes
    && valueInMinutes < endInMinutes
    && valueInMinutes % INTERVAL_MINUTES === 0;
}

function isSameDay(firstDate, secondDate) {
  return firstDate.getFullYear() === secondDate.getFullYear()
    && firstDate.getMonth() === secondDate.getMonth()
    && firstDate.getDate() === secondDate.getDate();
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
router.get("/available", validate(dateQuerySchema, "query"), async (req, res) => {
  const { date } = req.validated.query;

  if (!isDateStringValid(date)) {
    throw new AppError("Data inválida.", 400);
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

  const allSlots = generateSlots();

  const availableSlots = allSlots.filter(
    (slot) => !occupiedSlots.includes(slot)
  );

  const now = new Date();

  const filteredSlots = isSameDay(start, now)
    ? availableSlots.filter((slot) => combineDateAndTime(date, slot) > now)
    : availableSlots;

  return res.json(filteredSlots);
});

/**
 * POST /appointments
 * rota pública
 */
router.post("/", createAppointmentRateLimit, validate(createAppointmentSchema), async (req, res) => {
  const { name, phone, email, date, time, notes } = req.body;

  if (!isDateStringValid(date)) {
    throw new AppError("Data inválida.", 400);
  }

  if (!isTimeWithinBusinessHours(time)) {
    throw new AppError("Horário fora do expediente permitido.", 400);
  }

  const appointmentDate = combineDateAndTime(date, time);

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new AppError("Data ou horário inválidos.", 400);
  }

  if (appointmentDate <= new Date()) {
    throw new AppError("Não é possível agendar para um horário passado.", 400);
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

  try {
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
    if (error?.code === "P2002") {
      throw new AppError("Esse horário já foi reservado.", 409);
    }

    throw error;
  }
});

/**
 * Daqui para baixo é admin
 */
router.use(authMiddleware);

/**
 * GET /appointments?date=2026-04-12
 */
router.get("/", validate(dateQuerySchema, "query"), async (req, res) => {
  const { date } = req.validated.query;

  if (!isDateStringValid(date)) {
    throw new AppError("Data inválida.", 400);
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
});

/**
 * PATCH /appointments/:id/status
 */
router.patch(
  "/:id/status",
  validate(cuidParamSchema, "params"),
  validate(updateAppointmentStatusSchema),
  async (req, res) => {
    const { id } = req.validated.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    return res.json(appointment);
  }
);

export default router;