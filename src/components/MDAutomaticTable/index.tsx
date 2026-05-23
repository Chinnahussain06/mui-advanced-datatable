import React, { useState, useMemo, useEffect } from "react";
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
  DensityMedium as DensityMediumIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  SkipPrevious as SkipPreviousIcon,
  SkipNext as SkipNextIcon,
  Search as SearchIcon,
  GridView as GridViewIcon,
  TableChart as TableChartIcon
} from "@mui/icons-material";
import { ColumnDef, RowSelectionAction, ViewType } from "../../types";
import { rowsPerPageOptions } from "../../utils/constants";
import { getRowsPerPage, setRowsPerPage } from "../../backend/LocalStorage";
import { exportCsv } from "../../utils/exportCsv";
import MDBox from "../MDBox";
import MDTypography from "../MDTypography";
import MDInput from "../MDInput";
import MDButton from "../MDButton";
import MDPagination from "../MDPagination";
import MDLoader from "../MDLoader";

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  title: string;
  onUpdate?: () => void;
  onDownloadEnabled?: boolean;
  loading?: boolean;
  localStorageKey?: string;
  hiddenColumns?: string[];
  onToggleView?: (type: ViewType) => void;
  viewTypeEnabled?: boolean;
  renderTopToolBar?: boolean;
  onRowClick?: (event: React.MouseEvent, row: T) => void;
  isRowClickable?: boolean;
  enableRowSelection?: boolean;
  rowSelectionActions?: RowSelectionAction[];
}

export const MDAutomaticTable = <T extends { id: string | number }>({
  data,
  columns,
  title,
  loading = false,
  onToggleView,
  onUpdate,
  localStorageKey = "default",
  hiddenColumns = [],
  viewTypeEnabled = false,
  renderTopToolBar = true,
  isRowClickable = false,
  onRowClick,
  enableRowSelection = false,
  rowSelectionActions = [],
  onDownloadEnabled = true
}: TableProps<T>) => {

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Column visibility
  const [colAnchorEl, setColAnchorEl] = useState<null | HTMLElement>(null);
  const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem(`${localStorageKey}-col-visibility`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    // Default visibility
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

  // Density states: 'compact' | 'comfortable' | 'spacious'
  const [density, setDensity] = useState<"compact" | "comfortable" | "spacious">("compact");
  const [densityAnchorEl, setDensityAnchorEl] = useState<null | HTMLElement>(null);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(() => getRowsPerPage());

  // Row selection
  const [selectedRowIds, setSelectedRowIds] = useState<{ [key: string]: boolean }>({});

  const handleExportClick = () => {
    exportCsv(data, `${title.toLowerCase().replace(/\s+/g, "_")}_export.csv`);
  };

  const handleToggleColumn = (colKey: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [colKey]: !prev[colKey]
    }));
  };

  // Reset page index on search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPageIndex(0);
  };

  // Filtered and Sorted columns
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((item: any) => {
      return Object.keys(item).some(key => {
        const value = item[key];
        return String(value).toLowerCase().includes(lower);
      });
    });
  }, [data, searchTerm]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  // Select handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const selected: { [key: string]: boolean } = {};
      paginatedData.forEach(item => {
        selected[String(item.id)] = true;
      });
      setSelectedRowIds(selected);
    } else {
      setSelectedRowIds({});
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    setSelectedRowIds(prev => ({
      ...prev,
      [id]: e.target.checked
    }));
  };

  const selectedItems = useMemo(() => {
    return data.filter(item => selectedRowIds[String(item.id)]);
  }, [data, selectedRowIds]);

  const activeDensityPadding = {
    compact: "6px 12px",
    comfortable: "12px 16px",
    spacious: "18px 24px"
  }[density];

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <Card sx={{ p: 2, boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)", borderRadius: "12px" }}>
      {/* Top Toolbar using Flex layouts */}
      {renderTopToolBar && (
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          justifyContent: "space-between", 
          alignItems: { xs: "stretch", sm: "center" }, 
          gap: 2, 
          pb: 3 
        }}>
          {/* Action Left details */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MDTypography variant="h6" fontWeight="bold" sx={{ color: "#344767" }}>
              {title}
            </MDTypography>
            {onUpdate && (
              <Tooltip title="Update Data / Refetch">
                <IconButton onClick={onUpdate} size="small" sx={{ ml: 1, color: "#344767" }}>
                  <LoopIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDownloadEnabled && (
              <Tooltip title="Export to CSV">
                <IconButton onClick={handleExportClick} size="small" sx={{ color: "#344767" }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Search and control right indicators */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            {/* Search Box */}
            <MDInput
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: { xs: "100%", sm: "220px" } }}
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

            {/* Toggle Columns */}
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

            {/* Change Density */}
            <Tooltip title="Table Density">
              <IconButton onClick={(e) => setDensityAnchorEl(e.currentTarget)} size="small" sx={{ color: "#344767" }}>
                <DensityMediumIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={densityAnchorEl}
              open={Boolean(densityAnchorEl)}
              onClose={() => setDensityAnchorEl(null)}
            >
              <MenuItem onClick={() => { setDensity("compact"); setDensityAnchorEl(null); }} selected={density === "compact"}>Compact</MenuItem>
              <MenuItem onClick={() => { setDensity("comfortable"); setDensityAnchorEl(null); }} selected={density === "comfortable"}>Comfortable</MenuItem>
              <MenuItem onClick={() => { setDensity("spacious"); setDensityAnchorEl(null); }} selected={density === "spacious"}>Spacious</MenuItem>
            </Menu>

            {/* Toggle View (Grid vs Table) */}
            {viewTypeEnabled && onToggleView && (
              <Box sx={{ display: "inline-flex", border: "1px solid #ddd", borderRadius: "6px", p: 0.25 }}>
                <IconButton onClick={() => onToggleView("table")} size="small" color="primary">
                  <TableChartIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => onToggleView("card")} size="small">
                  <GridViewIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Row Selection Context Actions */}
            {enableRowSelection && selectedItems.length > 0 && rowSelectionActions.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {rowSelectionActions.map((action, idx) => (
                  <MDButton
                    key={idx}
                    variant={action.variant}
                    color={action.color}
                    size="small"
                    disabled={action.disabled}
                    onClick={() => {
                      action.onClick(selectedItems);
                      setSelectedRowIds({}); // clear selection
                    }}
                  >
                    {action.label}
                  </MDButton>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Actual Data Table */}
      {loading ? (
        <MDLoader />
      ) : (
        <TableContainer sx={{ border: "1px solid #f0f2f5", borderRadius: "8px" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {enableRowSelection && (
                  <TableCell padding="checkbox" sx={{ bgcolor: "#F8F9FA", borderBottom: "2px solid #ddd" }}>
                    <Checkbox
                      size="small"
                      onChange={handleSelectAll}
                      checked={paginatedData.length > 0 && paginatedData.every(item => selectedRowIds[String(item.id)])}
                      indeterminate={paginatedData.some(item => selectedRowIds[String(item.id)]) && !paginatedData.every(item => selectedRowIds[String(item.id)])}
                    />
                  </TableCell>
                )}
                {columns.map(col => {
                  const key = String(col.accessorKey);
                  if (columnVisibility[key] === false) return null;
                  return (
                    <TableCell
                      key={key}
                      sx={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        bgcolor: "#F8F9FA",
                        color: "#7b809a",
                        borderBottom: "2px solid #ddd",
                        padding: "10px 16px"
                      }}
                    >
                      {col.header}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (enableRowSelection ? 1 : 0)} align="center" sx={{ py: 6 }}>
                    <MDTypography variant="subtitle2" color="textSecondary">
                      No matching records found.
                    </MDTypography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => {
                  const rowId = String(row.id);
                  const isSelected = !!selectedRowIds[rowId];
                  return (
                    <TableRow
                      key={rowId}
                      hover
                      onClick={(e) => {
                        if (isRowClickable && onRowClick) {
                          onRowClick(e, row);
                        }
                      }}
                      sx={{
                        cursor: isRowClickable ? "pointer" : "default",
                        backgroundColor: isSelected ? "rgba(224, 242, 254, 0.4)" : "inherit"
                      }}
                    >
                      {enableRowSelection && (
                        <TableCell padding="checkbox" sx={{ padding: activeDensityPadding }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()} // prevent row click collision
                            onChange={(e) => handleSelectRow(e, rowId)}
                          />
                        </TableCell>
                      )}
                      {columns.map(col => {
                        const key = String(col.accessorKey);
                        if (columnVisibility[key] === false) return null;
                        return (
                          <TableCell
                            key={key}
                            sx={{
                              padding: activeDensityPadding,
                              fontSize: "13.5px",
                              borderBottom: "1px solid #f0f2f5"
                            }}
                          >
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

      {/* Custom Bottom Pagination */}
      <MDBox
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          pt: 2.5,
          gap: 2
        }}
      >
        <MDBox sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <MDTypography variant="button" color="textSecondary" sx={{ mr: 1, minWidth: "90px" }}>
            Rows per page:
          </MDTypography>
          <select
            value={pageSize}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              backgroundColor: "#FFF",
              outline: "none",
              cursor: "pointer",
              fontSize: "13px"
            }}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              setRowsPerPage(newSize);
              setPageIndex(0);
            }}
          >
            {rowsPerPageOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <MDTypography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
            {(() => {
              const start = filteredData.length === 0 ? 0 : pageIndex * pageSize + 1;
              const end = Math.min((pageIndex + 1) * pageSize, filteredData.length);
              return `Showing ${start} to ${end} of ${filteredData.length} records`;
            })()}
          </MDTypography>
        </MDBox>

        <MDBox sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <MDPagination
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0 || loading}
            title="First Page"
          >
            <SkipPreviousIcon fontSize="small" />
          </MDPagination>
          <MDPagination
            onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
            disabled={pageIndex === 0 || loading}
            title="Previous Page"
          >
            <NavigateBeforeIcon fontSize="small" />
          </MDPagination>
          <Box sx={{ px: 1.5 }}>
            <MDTypography variant="button" fontWeight="bold">
              Page {filteredData.length === 0 ? 0 : pageIndex + 1} of {Math.max(1, totalPages)}
            </MDTypography>
          </Box>
          <MDPagination
            onClick={() => setPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={pageIndex >= totalPages - 1 || loading}
            title="Next Page"
          >
            <NavigateNextIcon fontSize="small" />
          </MDPagination>
          <MDPagination
            onClick={() => setPageIndex(totalPages - 1)}
            disabled={pageIndex >= totalPages - 1 || loading}
            title="Last Page"
          >
            <SkipNextIcon fontSize="small" />
          </MDPagination>
        </MDBox>
      </MDBox>
    </Card>
  );
};

export default MDAutomaticTable;
