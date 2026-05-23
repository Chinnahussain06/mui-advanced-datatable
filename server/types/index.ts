export interface ItemEntity {
  id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Active" | "Pending" | "Completed" | "Archived";
  assignedTo: string;
  progress: number;
  updatedAt: string;
}

export interface ServerStats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  activeCount: number;
  avgProgress: number;
  dataSource: string;
}

export type PriorityType = "High" | "Medium" | "Low";
export type StatusType = "Active" | "Pending" | "Completed" | "Archived";
