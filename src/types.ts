/**
 * Types and Interfaces for Tables and Data Entities
 */

export type ViewType = "table" | "card";

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

export interface PaginationEntity {
  pageIndex: number;
  pageSize: number;
  nextKey: string | number | null;
  hasMoreData: boolean;
  totalItems: number;
}

export interface RowSelectionAction {
  variant: "contained" | "outlined" | "text";
  onClick: (data: any) => void;
  icon: string;
  color: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  disabled: boolean;
  label: string;
}

export interface ColumnDef<T> {
  accessorKey: keyof T | string;
  header: string;
  cell?: (info: { getValue: () => any; row: { original: T } }) => React.ReactNode;
  enableFiltering?: boolean;
}

export interface ServerStats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  activeCount: number;
  avgProgress: number;
  dataSource?: string;
}

