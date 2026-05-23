import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Box,
  InputAdornment
} from "@mui/material";
import {
  Loop as LoopIcon,
  Download as DownloadIcon,
  ViewColumn as ViewColumnIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { ColumnDef, ViewType } from "../../types";
import { rowsPerPageOptions } from "../../utils/constants";
import { exportCsv } from "../../utils/exportCsv";
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDPagination from "../MDPagination";
import MDLoader from "../MDLoader";

type TableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  title?: string;
  onUpdate?: () => void;
  loading?: boolean;
  pagination: { pageIndex: number; pageSize: number };
  setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
  hasMoreData?: boolean;
  totalItems?: number;
  columnPinning?: any;
  localStorageKey?: string;
  hiddenColumns?: string[];
  onToggleView?: (type: ViewType) => void;
  viewTypeEnabled?: boolean;
  renderTopToolBar?: boolean;
  isRowClickable?: boolean;
  onRowClick?: (event: React.MouseEvent, row: T) => void;
  manualFiltering?: boolean;
  setColumnFilters?: (filters: any) => void;
  columnFilters?: any;
  enableDownload?: boolean;
  wrapInCard?: boolean;
};

export const MDManualTable = <T extends { id: string | number }>({
  data,
  columns,
  title = "Manual Server Table",
  loading = false,
  pagination,
  setPagination,
  hasMoreData = false,
  onToggleView,
  onUpdate,
  totalItems = -1,
  localStorageKey = "manual",
  hiddenColumns = [],
  viewTypeEnabled = false,
  renderTopToolBar = true,
  isRowClickable = false,
  onRowClick,
  manualFiltering = false,
  setColumnFilters,
  columnFilters = "",
  enableDownload = false,
  wrapInCard = true
}: TableProps<T>) => {
  // Local menu open triggers
  const [colAnchorEl, setColAnchorEl] = useState<null | HTMLElement>(null);
  const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem(`${localStorageKey}-col-visibility`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    const initial: { [key: string]: boolean } = {};
    columns.forEach(col => {
      const key = String(col.accessorKey);
      initial[key] = !hiddenColumns.includes(key);
    });
    return initial;
  });

  // Save visibility when changed
  useEffect(() => {
    localStorage.setItem(`${localStorageKey}-col-visibility`, JSON.stringify(columnVisibility));
  }, [columnVisibility, localStorageKey]);

  const handleExportClick = () => {
    exportCsv(data, `${title.toLowerCase().replace(/\s+/g, "_")}_export.csv`);
  };

  const handleToggleColumn = (colKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  };

  const tableHeaderStyle = {
    fontWeight: "bold",
    fontSize: "12px",
    bgcolor: "#F8F9FA",
    color: "#7b809a",
    borderBottom: "2px solid #ddd",
    padding: "10px 16px"
  };

  const cellStyle = {
    padding: "8px 16px",
    fontSize: "13.5px",
    borderBottom: "1px solid #f0f2f5"
  };

  const TableContent = (
    <Box>
      {/* Top Toolbar */}
      {renderTopToolBar && (
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          justifyContent: "space-between", 
          alignItems: { xs: "stretch", sm: "center" }, 
          gap: 2, 
          pb: 3, 
          pt: wrapInCard ? 0 : 2 
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#344767" }}>
              {title}
            </MDTypography>
            {onUpdate && (
              <Tooltip title="Refresh Server Data">
                <IconButton onClick={onUpdate} size="small" sx={{ ml: 1, color: "#344767" }}>
                  <LoopIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {enableDownload && (
              <Tooltip title="Export to CSV">
                <IconButton onClick={handleExportClick} size="small" sx={{ ml: 1, color: "#344767" }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5 }}>
            {/* Search Filter for Server Simulation */}
            {manualFiltering && setColumnFilters && (
              <MDInput
                placeholder="Server search..."
                value={columnFilters}
                onChange={(e: any) => {
                  setColumnFilters(e.target.value);
                  setPagination(prev => ({ ...prev, pageIndex: 0 })); // reset index
                }}
                sx={{ width: { xs: "100%", sm: "200px" } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    )
                  }
                }}
              />
            )}

            {/* Column Hide/Show Option */}
            <Tooltip title="Show/Hide Columns">
              <IconButton onClick={(e) => setColAnchorEl(e.currentTarget)} size="small" sx={{ color: "#344767" }}>
                <ViewColumnIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={colAnchorEl}
              open={Boolean(colAnchorEl)}
              onClose={() => setColAnchorEl(null)}
              slotProps={{
                paper: {
                  style: { maxHeight: 300, width: "200px" }
                }
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <MDTypography variant="caption" fontWeight="bold">Columns Visibility</MDTypography>
              </Box>
              {columns.map(col => {
                const key = String(col.accessorKey);
                return (
                  <MenuItem key={key} dense>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={!!columnVisibility[key]}
                          onChange={() => handleToggleColumn(key)}
                        />
                      }
                      label={col.header}
                      sx={{ width: "100%", margin: 0 }}
                    />
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>
        </Box>
      )}

      {/* Main Table Layout */}
      {loading ? (
        <MDLoader />
      ) : (
        <TableContainer sx={{ border: "1px solid #f0f2f5", borderRadius: "8px" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {columns.map(col => {
                  const key = String(col.accessorKey);
                  if (columnVisibility[key] === false) return null;
                  return (
                    <TableCell key={key} sx={tableHeaderStyle}>
                      {col.header}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                    <MDTypography variant="subtitle2" color="textSecondary">
                      No records returned from back-end server.
                    </MDTypography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => {
                  const rowId = String(row.id);
                  return (
                    <TableRow
                      key={rowId}
                      hover
                      onClick={(e) => {
                        if (isRowClickable && onRowClick) {
                          onRowClick(e, row);
                        }
                      }}
                      sx={{ cursor: isRowClickable ? "pointer" : "default" }}
                    >
                      {columns.map(col => {
                        const key = String(col.accessorKey);
                        if (columnVisibility[key] === false) return null;
                        return (
                          <TableCell key={key} sx={cellStyle}>
                            {col.cell ? (
                              col.cell({
                                getValue: () => (row as any)[key],
                                row: { original: row }
                              })
                            ) : (
                              String((row as any)[key] || "")
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Manual Pagination Section */}
      <MDBox
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          pt: 2.5,
          pb: wrapInCard ? 0 : 2
        }}
      >
        <MDBox sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <select
            value={pagination.pageSize}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              backgroundColor: "#FFF",
              outline: "none",
              cursor: "pointer",
              fontSize: "13px"
            }}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPagination({ pageIndex: 0, pageSize: newSize });
            }}
          >
            {rowsPerPageOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <MDTypography variant="caption" color="textSecondary">
            {(() => {
              const start = data.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
              const end = pagination.pageIndex * pagination.pageSize + data.length;
              const totalStr = totalItems >= 0 ? `of ${totalItems}` : "";
              return `Showing ${start} to ${end} ${totalStr} (Server Index: ${pagination.pageIndex})`;
            })()}
          </MDTypography>
        </MDBox>

        <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MDPagination
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
            disabled={pagination.pageIndex === 0 || loading}
            title="Previous Page"
          >
            <NavigateBeforeIcon fontSize="small" />
          </MDPagination>

          <Box sx={{ px: 1.5 }}>
            <MDTypography variant="button" fontWeight="bold">
              Page {pagination.pageIndex + 1}
            </MDTypography>
          </Box>

          <MDPagination
            onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            disabled={!hasMoreData || loading}
            title="Next Page"
          >
            <NavigateNextIcon fontSize="small" />
          </MDPagination>
        </MDBox>
      </MDBox>
    </Box>
  );

  return wrapInCard ? <Card sx={{ p: 2, boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)", borderRadius: "12px" }}>{TableContent}</Card> : TableContent;
};

export default MDManualTable;
