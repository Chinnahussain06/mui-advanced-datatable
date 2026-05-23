import { Router, Request, Response } from "express";
import { ItemService } from "../services/itemService";
import { DatabaseStore } from "../database/store";
import { Logger } from "../utils/logger";

const router = Router();

// Middleware to audit incoming API requests
router.use((req, res, next) => {
  Logger.info(`${req.method} request received at ${req.path}`, "HTTP_CONTROLLER");
  next();
});

// API Health Indicator
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET System Metrics
router.get("/stats", (req: Request, res: Response) => {
  try {
    const stats = ItemService.getStats();
    res.json(stats);
  } catch (error) {
    Logger.error("Error reading statistics", "API_STATS", error);
    res.status(500).json({ error: "Failed to load database stats" });
  }
});

// GET All records
router.get("/items/all", (req: Request, res: Response) => {
  try {
    const all = DatabaseStore.getAll();
    res.json(all);
  } catch (error) {
    Logger.error("Error processing GET /api/items/all", "API_ITEMS_ALL", error);
    res.status(500).json({ error: "Failed to stream items dataset" });
  }
});

// GET Paginated entries (Cursor offsets)
router.get("/items", (req: Request, res: Response) => {
  try {
    const pageIndex = parseInt(req.query.pageIndex as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 5;
    const cursor = (req.query.cursor as string) || null;
    const searchQuery = (req.query.searchQuery as string || "").trim();

    const result = ItemService.getPaginatedItems(pageIndex, pageSize, cursor, searchQuery);
    res.json(result);
  } catch (error) {
    Logger.error("Error paging record collections", "API_ITEMS_PAGED", error);
    res.status(500).json({ error: "Pagination query error encountered" });
  }
});

// POST creates tasks
router.post("/items", (req: Request, res: Response) => {
  try {
    const { title, category, priority, status, assignedTo, progress } = req.body;
    
    const created = ItemService.createItem({
      title,
      category,
      priority,
      status,
      assignedTo,
      progress
    });

    Logger.info(`Successfully processed record creation context: ${created.id}`, "API_ITEM_POST");
    res.status(201).json(created);
  } catch (error) {
    Logger.error("Failed to construct item", "API_ITEMS_POST", error);
    res.status(400).json({ error: "Payload verification failed" });
  }
});

// PUT updates assignees bulk
router.put("/items/bulk-assign", (req: Request, res: Response) => {
  try {
    const { ids, assignedTo } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Payload requirement 'ids' is either missing or not an array" });
    }

    const affected = DatabaseStore.bulkAssign(ids, assignedTo);
    Logger.info(`Bulk assignment completed. Affected records: ${affected}`, "API_BULK_ASSIGN");
    res.json({ success: true, updatedCount: affected });
  } catch (error) {
    Logger.error("Error during bulk assignment mapping", "API_BULK_ASSIGN", error);
    res.status(500).json({ error: "Failed to perform batch mutations" });
  }
});

// PUT completes items bulk
router.put("/items/bulk-complete", (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Payload requirement 'ids' is either missing or not an array" });
    }

    const affected = DatabaseStore.bulkComplete(ids);
    Logger.info(`Bulk completion finished. Affected records: ${affected}`, "API_BULK_COMPLETE");
    res.json({ success: true, updatedCount: affected });
  } catch (error) {
    Logger.error("Error during bulk complete sequence", "API_BULK_COMPLETE", error);
    res.status(500).json({ error: "Failed to perform bulk updates" });
  }
});

export default router;
