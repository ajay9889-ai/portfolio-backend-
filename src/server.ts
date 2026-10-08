import "dotenv/config";
import type { Express } from "express";

let app: Express;
try {
  const mod = await import("./app.js");
  app = mod.app;
} catch {
  // @ts-ignore
  const mod = await import("../dist/app.js");
  app = mod.app;
}

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log("====================================================");
  console.log("🚀 Portfolio Backend API is Live!");
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/health`);
  console.log(`📚 API Root: http://localhost:${PORT}${process.env.API_PREFIX || "/api/v1"}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("====================================================");
});

const handleShutdown = (signal: string) => {
  console.log(`\n[${signal}] Initiating graceful server shutdown...`);
  server.close(() => {
    console.log("Server connections closed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
