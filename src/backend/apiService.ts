import { ItemEntity, ServerStats } from "../types";

/**
 * Enterprise client-side API class wrapping all back-end service calls.
 */
export class ApiService {
  private static BASE_URL = "/api";

  /**
   * Fetch live data metrics from the Express API server
   */
  static async fetchStats(): Promise<ServerStats> {
    const response = await fetch(`${this.BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch live server metrics: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Create standard task or alert directly on live Express system
   */
  static async createItem(item: Partial<ItemEntity>): Promise<ItemEntity> {
    const response = await fetch(`${this.BASE_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error(`POST transaction rejected by Express backend: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Bulk update owners/assignees of multiple distinct tasks on backing tier
   */
  static async bulkAssign(ids: string[], assignedTo: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.BASE_URL}/items/bulk-assign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, assignedTo }),
    });
    if (!response.ok) {
      throw new Error(`Bulk assign state update failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Bulk execute state transitions to completed for lists of items
   */
  static async bulkComplete(ids: string[]): Promise<{ success: boolean }> {
    const response = await fetch(`${this.BASE_URL}/items/bulk-complete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      throw new Error(`Bulk complete state update failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Dynamic dynamic cursor navigation method query matching page context slices
   */
  static async fetchItems(
    pageIndex: number,
    pageSize: number,
    currentCursor: string | null,
    searchQuery: string = ""
  ): Promise<{ data: ItemEntity[]; nextKey: string | null; totalItems?: number }> {
    const url = new URL(`${this.BASE_URL}/items`, window.location.origin);
    url.searchParams.append("pageIndex", String(pageIndex));
    url.searchParams.append("pageSize", String(pageSize));
    if (currentCursor) {
      url.searchParams.append("cursor", currentCursor);
    }
    if (searchQuery) {
      url.searchParams.append("searchQuery", searchQuery);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch items from backend: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch entire cached or seeded database list (used in automatic rapid processing)
   */
  static async fetchAllItems(): Promise<ItemEntity[]> {
    const response = await fetch(`${this.BASE_URL}/items/all`);
    if (!response.ok) {
      throw new Error(`Failed to fetch all backend items: ${response.statusText}`);
    }
    return response.json();
  }
}
