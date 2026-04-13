import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const nameSchema = z.string()
  .trim()
  .min(2, "Nome deve ter ao menos 2 caracteres.")
  .max(120, "Nome muito longo.");

const phoneSchema = z.string()
  .trim()
  .transform((value) => value.replace(/\D/g, ""))
  .refine(
    (value) => value.length >= 10 && value.length <= 13,
    "Telefone inválido. Informe DDD + número."
  );

const optionalEmailSchema = z
  .union([
    z.string().trim().email("Email inválido."),
    z.literal(""),
    z.undefined(),
    z.null()
  ])
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value.toLowerCase();
  });

const optionalNotesSchema = z
  .union([
    z.string().trim().max(500, "Observações muito longas."),
    z.literal(""),
    z.undefined(),
    z.null()
  ])
  .transform((value) => {
    if (!value) {
      return null;
    }

    return value;
  });

const dateSchema = z
  .string()
  .regex(dateRegex, "Data inválida. Use o formato YYYY-MM-DD.");

const timeSchema = z
  .string()
  .regex(timeRegex, "Horário inválido. Use o formato HH:mm.");

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido."),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres.")
});

export const createCustomerSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema
});

export const dateQuerySchema = z.object({
  date: dateSchema
});

export const createAppointmentSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  date: dateSchema,
  time: timeSchema,
  notes: optionalNotesSchema
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "DONE", "CANCELED"], {
    message: "Status inválido."
  })
});

export const cuidParamSchema = z.object({
  id: z.string().trim().min(10, "ID inválido.")
});
