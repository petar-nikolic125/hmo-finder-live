import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { performStartupCheck } from "./utils/startup-check.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function initializeApp() {
  // Run comprehensive startup check (non-blocking)
  performStartupCheck().catch((error) => {
    log(`⚠️ Startup check failed: ${error}`);
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Only start server if not in Vercel environment or Railway build
  if (!process.env.VERCEL && !process.env.RAILWAY_STATIC_URL && !process.env.RAILWAY_ENVIRONMENT && !process.env.RAILWAY) {
    // Configure server timeouts for better reliability
    server.timeout = 60000; // 60 seconds
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds

    // Use environment PORT for production deployment compatibility
    // Railway, Heroku, and other platforms set PORT automatically
    const port = parseInt(process.env.PORT) || 5000;
    const host = process.env.HOST || "0.0.0.0";
    
    server.listen(port, host, () => {
      log(`serving on ${host}:${port}`);
      
      // Log deployment platform for debugging
      if (process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT) {
        log(`🚂 Running on Railway: ${process.env.RAILWAY_STATIC_URL || 'Railway Environment'}`);
      } else if (process.env.HEROKU_APP_NAME) {
        log(`🟣 Running on Heroku: ${process.env.HEROKU_APP_NAME}`);
      } else if (process.env.RENDER) {
        log(`🟢 Running on Render`);
      } else {
        log(`🔵 Running on Replit/Local`);
      }
    });
  }
  
  return app;
}

// For regular deployment (Replit, local)
if (!process.env.VERCEL) {
  initializeApp();
}

// Export the app initialization function for Vercel
export { initializeApp };
