import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRoutes from "./server/routes/api";
import { ItemService } from "./server/services/itemService";
import { Logger } from "./server/utils/logger";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Core global middleware setups
  app.use(express.json());

  // 2. Decoupled REST Router Integration
  app.use("/api", apiRoutes);

  // 3. Asset Loading pipeline (Vite Middleware vs Static Distribution)
  if (process.env.NODE_ENV !== "production") {
    Logger.info("Starting express server inside live Development with Vite Pipeline...", "BOOTLOADER");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    Logger.info("Starting express server inside optimized standalone Production Mode...", "BOOTLOADER");
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  // 4. Bind listeners
  app.listen(PORT, "0.0.0.0", () => {
    Logger.info(`Secure Express Engine dynamically online at port ${PORT}`, "CORE_ENGINE");
    
    // Seed initial dataset asynchronously on boot to prevent server blockings
    ItemService.seedInitialData()
      .then(() => {
        Logger.info("Core collection database seeding complete.", "BOOTLOADER");
      })
      .catch((err) => {
        Logger.error("Failed to boot seed items safely", "BOOTLOADER", err);
      });
  });
}

startServer().catch((error) => {
  Logger.error("CRITICAL: Extreme engine boot panic!", "SYS_FAILURE", error);
});
