import { DatabaseStore } from "../database/store";
import { ItemEntity, ServerStats } from "../types";
import { Logger } from "../utils/logger";

export class ItemService {
  /**
   * Performs real third-party API fetch and populates the local DatabaseStore
   */
  static async seedInitialData(): Promise<void> {
    try {
      Logger.info("Starting external API dynamic data-seeding sequence...", "SEED_SERVICE");
      const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=45");
      
      if (!response.ok) {
        throw new Error(`Failed to contact public JSONPlaceholder API: ${response.statusText}`);
      }

      const externalTodos = await response.json();
      if (!Array.isArray(externalTodos) || externalTodos.length === 0) {
        Logger.warn("Received empty todo payload. Utilizing fallback local dataset.", "SEED_SERVICE");
        return;
      }

      const categories = ["Engineering", "Security", "Design", "Database", "Compliance", "Product"];
      const priorities: ("High" | "Medium" | "Low")[] = ["High", "Medium", "Low"];
      const personnel = ["Sarah Connor", "John Connor", "Elena Rose", "David Kim", "Alex Mercer"];

      const mappedItems: ItemEntity[] = externalTodos.map((todo: any) => {
        const category = categories[todo.id % categories.length];
        const priority = priorities[(todo.id * 3) % priorities.length];
        const assignedTo = personnel[(todo.id + 2) % personnel.length];
        let status: "Active" | "Pending" | "Completed" | "Archived" = "Pending";
        let progress = 0;

        if (todo.completed) {
          status = "Completed";
          progress = 100;
        } else {
          const rem = todo.id % 3;
          if (rem === 1) {
            status = "Active";
            progress = Math.min(((todo.id * 17) % 90) + 5, 95);
          } else if (rem === 2) {
            status = "Pending";
            progress = (todo.id * 7) % 30;
          } else {
            status = "Archived";
            progress = 100;
          }
        }

        const descriptionRaw = todo.title || "";
        const formattedTitle = descriptionRaw.charAt(0).toUpperCase() + descriptionRaw.slice(1);

        return {
          id: `TK-${todo.id + 100}`,
          title: `${formattedTitle} (Dummy API)`,
          category,
          priority,
          status,
          assignedTo,
          progress,
          updatedAt: new Date(Date.now() - todo.id * 3600000).toISOString()
        };
      });

      DatabaseStore.setAll(mappedItems, "Live JSONPlaceholder Todos API");
      Logger.info(`Successfully synchronized ${mappedItems.length} records into Data Access Layer.`, "SEED_SERVICE");
    } catch (error) {
      Logger.error("Failed to seed dynamic data. Retaining default mock fallbacks.", "SEED_SERVICE", error);
    }
  }

  /**
   * Compute server metrics on the dataset
   */
  static getStats(): ServerStats {
    const items = DatabaseStore.getAll();
    const totalCount = items.length;
    const completedCount = items.filter(i => i.status === "Completed").length;
    const pendingCount = items.filter(i => i.status === "Pending").length;
    const activeCount = items.filter(i => i.status === "Active").length;

    let avgProgressValue = 0;
    if (totalCount > 0) {
      const sum = items.reduce((sum, item) => sum + item.progress, 0);
      avgProgressValue = Math.round(sum / totalCount);
    }

    return {
      totalCount,
      completedCount,
      pendingCount,
      activeCount,
      avgProgress: avgProgressValue,
      dataSource: DatabaseStore.getDataSourceName()
    };
  }

  /**
   * Filter and paginate items based on cursor key or offsets
   */
  static getPaginatedItems(
    pageIndex: number,
    pageSize: number,
    cursor: string | null,
    searchQuery: string
  ): { data: ItemEntity[]; nextKey: string | null; totalItems: number } {
    const allItems = DatabaseStore.getAll();
    let filtered = [...allItems];

    if (searchQuery) {
      const criteria = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(criteria) ||
        item.category.toLowerCase().includes(criteria) ||
        item.assignedTo.toLowerCase().includes(criteria) ||
        item.status.toLowerCase().includes(criteria)
      );
    }

    let startOffset = 0;
    if (cursor && cursor.startsWith("cursor-")) {
      const cursorVal = parseInt(cursor.replace("cursor-", ""), 10);
      if (!isNaN(cursorVal)) {
        startOffset = cursorVal;
      }
    } else {
      startOffset = pageIndex * pageSize;
    }

    const slicedData = filtered.slice(startOffset, startOffset + pageSize);
    const nextOffset = startOffset + pageSize;
    const hasMore = nextOffset < filtered.length;
    const nextKey = hasMore ? `cursor-${nextOffset}` : null;

    return {
      data: slicedData,
      nextKey,
      totalItems: filtered.length
    };
  }

  /**
   * Adds custom ticket record into local store
   */
  static createItem(payload: Partial<ItemEntity>): ItemEntity {
    const idNum = Math.floor(Math.random() * 900) + 200;
    const newItem: ItemEntity = {
      id: `TK-${idNum}`,
      title: payload.title || `Ticket task simulated verification #${idNum}`,
      category: payload.category || "Engineering",
      priority: payload.priority || "Low",
      status: payload.status || "Pending",
      assignedTo: payload.assignedTo || "Sarah Connor",
      progress: payload.progress !== undefined ? payload.progress : 0,
      updatedAt: new Date().toISOString()
    };

    return DatabaseStore.insert(newItem);
  }
}
