import { ItemEntity } from "../types";

export class DatabaseStore {
  private static items: ItemEntity[] = [];
  private static dataSource = "In-Memory Core Cache";

  /**
   * Replace contents of the database (called by seeding engine)
   */
  static setAll(items: ItemEntity[], source: string) {
    this.items = [...items];
    this.dataSource = source;
  }

  /**
   * Retrieve all items
   */
  static getAll(): ItemEntity[] {
    return [...this.items];
  }

  /**
   * Retrieve currently connected downstream source
   */
  static getDataSourceName(): string {
    return this.dataSource;
  }

  /**
   * Save a single record on top
   */
  static insert(item: ItemEntity): ItemEntity {
    this.items.unshift(item);
    return item;
  }

  /**
   * Bulk update items (assignees, etc)
   */
  static bulkAssign(ids: string[], assignedTo: string): number {
    let affected = 0;
    this.items = this.items.map(item => {
      if (ids.includes(item.id)) {
        affected++;
        return {
          ...item,
          assignedTo: assignedTo || "Current User",
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    return affected;
  }

  /**
   * Bulk mark items completed
   */
  static bulkComplete(ids: string[]): number {
    let affected = 0;
    this.items = this.items.map(item => {
      if (ids.includes(item.id)) {
        affected++;
        return {
          ...item,
          status: "Completed",
          progress: 100,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    return affected;
  }
}
