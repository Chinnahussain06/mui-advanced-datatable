import { ItemEntity } from "../types";

export class DatabaseStore {
  private static items: ItemEntity[] = [];
  private static dataSource = "In-Memory Core Cache";

  static setAll(items: ItemEntity[], source: string) {
    this.items = [...items];
    this.dataSource = source;
  }

  static getAll(): ItemEntity[] {
    return [...this.items];
  }

  static getDataSourceName(): string {
    return this.dataSource;
  }

  static insert(item: ItemEntity): ItemEntity {
    this.items.unshift(item);
    return item;
  }

  static bulkAssign(ids: string[], assignedTo: string): number {
    let affected = 0;
    this.items = this.items.map((item) => {
      if (ids.includes(item.id)) {
        affected++;
        return {
          ...item,
          assignedTo: assignedTo || "Current User",
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    return affected;
  }

  static bulkComplete(ids: string[]): number {
    let affected = 0;
    this.items = this.items.map((item) => {
      if (ids.includes(item.id)) {
        affected++;
        return {
          ...item,
          status: "Completed",
          progress: 100,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    return affected;
  }
}
