import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import { env } from "./config/env.js";
import { requestContext } from "./middlewares/request-context.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";

const app = express();

const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: "Muitas requisições. Tente novamente em alguns minutos."
    });
  }
});

const corsOrigin = env.CORS_ORIGIN === "*"
  ? true
  : env.CORS_ORIGIN;

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(requestContext);
app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(globalRateLimit);

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "backend-agendamento",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeInSeconds: Math.floor(process.uptime()),
    requestId: req.id
  });
});

app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/appointments", appointmentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;