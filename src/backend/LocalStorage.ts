import { ViewType } from "../types";

export const getRowsPerPage = (): number => {
  const val = localStorage.getItem("rowsPerPage");
  return val ? Number(val) : 5;
};

export const setRowsPerPage = (size: number): void => {
  localStorage.setItem("rowsPerPage", size.toString());
};

export const getViewType = (key: string): ViewType => {
  const val = localStorage.getItem(key);
  return (val as ViewType) || "table";
};

export const setViewType = (key: string, type: ViewType): void => {
  localStorage.setItem(key, type);
};
