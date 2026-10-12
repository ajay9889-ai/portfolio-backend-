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
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Session-Id", "X-Analytics-Secret"]
}));

// 3. Body Parsing & Logging (50kb limit)
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// 4. Rate Limiting
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    ok: false,
    error: "Too many contact requests from this IP. Please wait before submitting again, or email ajayhasrb123@gmail.com directly."
  }
});
app.use("/api/v1/contact", contactLimiter);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "AI rate limit reached. Please wait a moment before sending your next question."
  }
});
app.use("/api/v1/chat", chatLimiter);

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
