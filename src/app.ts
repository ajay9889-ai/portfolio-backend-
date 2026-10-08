import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { apiRouter } from "./routes/apiRouter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Express = express();

// 1. Security & Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// 3. Body Parsing & Logging
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// 4. Rate Limiting for Contact Form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many contact requests from this IP. Please try again in 15 minutes."
  }
});
app.use("/api/v1/contact", contactLimiter);

// 5. Root Health Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "Portfolio Backend API",
    version: "1.0.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 6. Mount API v1 Router
const prefix = process.env.API_PREFIX || "/api/v1";
app.use(prefix, apiRouter);

// 7. 404 Catch-all
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Resource not found at ${req.method} ${req.originalUrl}`
  });
});

// 8. Global Error Handler
app.use(errorHandler);

export { app };
