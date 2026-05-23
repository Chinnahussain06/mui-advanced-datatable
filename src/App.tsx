/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  Container, 
  Box, 
  Card, 
  Tabs, 
  Tab, 
  Chip, 
  LinearProgress, 
  Avatar,
  Snackbar,
  Alert
} from "@mui/material";
import { 
  AutoAwesome as AutoAwesomeIcon, 
  Cached as CachedIcon,
  PlaylistAdd as PlaylistAddIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon
} from "@mui/icons-material";

// Import Custom components
import MDBox from "./components/MDBox";
import MDTypography from "./components/MDTypography";
import MDButton from "./components/MDButton";
import MDLoader from "./components/MDLoader";
import MDAutomaticTable from "./components/MDAutomaticTable";
import MDManualTable from "./components/MDManualTable";
import MDStatsCard from "./components/MDStatsCard";
import { usePaginatedItems } from "./hooks/usePaginatedItems";
import { ApiService } from "./backend/apiService";
import { ItemEntity, ColumnDef } from "./types";

// Instantiate the Query Client for React Query
const queryClient = new QueryClient();

function MainDashboard() {
  // Primary Tabs
  const [activeView, setActiveView] = useState<number>(0);

  // Dynamic Item List supporting local updates for MDAutomaticTable
  const [localItems, setLocalItems] = useState<ItemEntity[]>([]);
  const [isAutomaticLoading, setIsAutomaticLoading] = useState<boolean>(false);

  // Live Server Statistics State
  const [serverStats, setServerStats] = useState({
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    activeCount: 0,
    avgProgress: 0,
    dataSource: "Syncing..."
  });

  // Status Alerts
  const [alertState, setAlertState] = useState<{ open: boolean; message: string; severity: "success" | "info" | "warning" }>({
    open: false,
    message: "",
    severity: "success"
  });

  const triggerAlert = (message: string, severity: "success" | "info" | "warning" = "success") => {
    setAlertState({ open: true, message, severity });
  };

  // Synchronize both client lists and dashboard metrics with the real backend server
  const syncAllData = async () => {
    setIsAutomaticLoading(true);
    try {
      // 1. Fetch entire list from server for local fast-processing table
      const list = await ApiService.fetchAllItems();
      setLocalItems(list);

      // 2. Fetch live statistics from Express API server
      const stats = await ApiService.fetchStats();
      setServerStats({
        totalCount: stats.totalCount,
        completedCount: stats.completedCount,
        pendingCount: stats.pendingCount,
        activeCount: stats.activeCount,
        avgProgress: stats.avgProgress,
        dataSource: stats.dataSource || "In-Memory Core Cache"
      });
    } catch (err: any) {
      triggerAlert(err?.message || "Failed to sync with API server", "warning");
    } finally {
      setIsAutomaticLoading(false);
    }
  };

  // Load database content on mount
  React.useEffect(() => {
    syncAllData();
  }, [activeView]); // Reload stats and lists when switching views

  // Add Item callback - Performs real POST transaction on Express backend
  const handleAddNewItem = async () => {
    const payload: Partial<ItemEntity> = {
      title: "New ticket added to live Express backend database",
      category: "Engineering",
      priority: Math.random() > 0.5 ? "High" : "Low",
      status: "Pending",
      assignedTo: "Sarah Connor",
      progress: 0
    };

    try {
      const created = await ApiService.createItem(payload);
      triggerAlert(`Created item ${created.id} inside live server!`, "success");
      
      // Force sync backend updates into our state
      await syncAllData();
      
      // Also flush TanStack Query cache to reload manual table entries instantly
      refetchManualServer();
    } catch (err: any) {
      triggerAlert(err?.message || "POST transaction failed", "warning");
    }
  };

  // Refetch simulated server trigger
  const [serverSearchQuery, setServerSearchQuery] = useState("");
  const [manualTriggerVal] = useState(0);

  // Connect TanStack Query to simulated server
  const {
    data: manualData,
    isLoading: isManualLoading,
    isFetching: isManualFetching,
    pagination: manualPagination,
    setPagination: setManualPagination,
    hasNextPage: manualHasNextPage,
    refetch: refetchManualServer,
  } = usePaginatedItems({
    key: `server-items-${manualTriggerVal}-${serverSearchQuery}`,
    fetchCb: (index, limit, cursorKey) => 
      ApiService.fetchItems(index, limit, cursorKey, serverSearchQuery)
  });

  // Table columns definition compatible with ColumnDef<ItemEntity>
  const columns: ColumnDef<ItemEntity>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "Ticket ID",
      cell: ({ getValue }) => (
        <MDTypography variant="button" fontWeight="bold" sx={{ color: "primary.main", fontFamily: "var(--font-mono)" }}>
          {getValue()}
        </MDTypography>
      )
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ getValue, row }) => {
        const priority = row.original.priority;
        const dotColor = priority === "High" ? "#f44336" : priority === "Medium" ? "#ffa726" : "#26c6da";
        return (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <MDTypography variant="button" fontWeight="medium" sx={{ color: "#344767", display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ width: "8px", height: "8px", borderRadius: "50%", bgcolor: dotColor, display: "inline-block" }} />
              {getValue()}
            </MDTypography>
            <MDTypography variant="caption" color="textSecondary">
              Assigned to: <strong>{row.original.assignedTo}</strong>
            </MDTypography>
          </Box>
        );
      }
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ getValue }) => (
        <Chip label={getValue()} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: "11px", height: "20px" }} />
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        let color: "success" | "warning" | "info" | "default" = "default";
        if (val === "Active") color = "info";
        else if (val === "Completed") color = "success";
        else if (val === "Pending") color = "warning";
        return (
          <Chip 
            label={val} 
            size="small" 
            color={color} 
            sx={{ fontWeight: "bold", fontSize: "10px", height: "20px" }} 
          />
        );
      }
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ getValue }) => {
        const val = Number(getValue());
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100px" }}>
            <MDTypography variant="button" fontWeight="medium" color="textSecondary">{val}%</MDTypography>
            <LinearProgress 
              variant="determinate" 
              value={val} 
              sx={{ flexGrow: 1, height: "4px", borderRadius: "2px" }}
            />
          </Box>
        );
      }
    },
    {
      accessorKey: "updatedAt",
      header: "Last Update",
      cell: ({ getValue }) => {
        const d = new Date(getValue());
        return (
          <MDTypography variant="caption" color="textSecondary" sx={{ fontFamily: "var(--font-mono)" }}>
            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </MDTypography>
        );
      }
    }
  ], []);

  // Set up row selection action callbacks for automatic table using real API transactions
  const selectedRowActions = useMemo(() => [
    {
      label: "Assign to Me",
      variant: "outlined" as const,
      color: "primary" as const,
      disabled: false,
      icon: "person",
      onClick: async (selectedItems: ItemEntity[]) => {
        const ids = selectedItems.map(item => item.id);
        try {
          await ApiService.bulkAssign(ids, "Current User");
          triggerAlert(`Assigned ${ids.length} ticket(s) to you on backend!`, "success");
          await syncAllData();
          refetchManualServer();
        } catch (err: any) {
          triggerAlert(err?.message || "API assign state update failed", "warning");
        }
      }
    },
    {
      label: "Complete Selected",
      variant: "contained" as const,
      color: "success" as const,
      disabled: false,
      icon: "check_circle",
      onClick: async (selectedItems: ItemEntity[]) => {
        const ids = selectedItems.map(item => item.id);
        try {
          await ApiService.bulkComplete(ids);
          triggerAlert(`Marked ${ids.length} ticket(s) as Completed on backend!`, "success");
          await syncAllData();
          refetchManualServer();
        } catch (err: any) {
          triggerAlert(err?.message || "API complete state update failed", "warning");
        }
      }
    }
  ], []);

  // Update Automatic Table - Fetch newest information
  const handleUpdateAutomatic = () => {
    syncAllData().then(() => {
      triggerAlert("Refetched all live documents from Express backend!", "success");
    });
  };

  // Update Manual Table
  const handleUpdateManual = () => {
    refetchManualServer();
    triggerAlert("Dispatched async refetch signal to mock servers!", "info");
  };

  return (
    <MDBox sx={{ backgroundColor: "#F4F6F9", pb: 8, minHeight: "100vh" }}>
      {/* Top Banner Branding Area */}
      <MDBox bgColor="#1C1F26" sx={{ color: "#FFF", py: 5, mb: 4, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", md: "row" }, 
            justifyContent: "space-between", 
            alignItems: { xs: "stretch", md: "center" }, 
            gap: 3 
          }}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
                  <AutoAwesomeIcon fontSize="small" />
                </Avatar>
                <Chip label="Enterprise Ready" size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#FFF", fontWeight: "bold" }} />
              </Box>
              <MDTypography variant="h3" fontWeight="bold">
                MUI Data Tables & Pagination Center
              </MDTypography>
              <MDTypography variant="subtitle1" sx={{ opacity: 0.82, mt: 0.5 }}>
                An interactive playground showing standard Automatic vs. Manual Pagination schemas. Designed for React 19, Vite, and Material UI, featuring complete schema explanations for GitHub.
              </MDTypography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, flexShrink: 0 }}>
              <MDButton 
                variant="contained" 
                color="primary"
                startIcon={<PlaylistAddIcon />}
                onClick={handleAddNewItem}
                sx={{
                  backgroundColor: "#2E66E5",
                  "&:hover": { backgroundColor: "#1e4bb2" },
                  px: 3, py: 1.2, fontWeight: "bold",
                  whiteSpace: "nowrap"
                }}
              >
                Insert Live Task
              </MDButton>
            </Box>
          </Box>
        </Container>
      </MDBox>

      {/* Main Container */}
      <Container maxWidth="lg">
        {/* Statistics Panels Grid (Metrics) using CSS grid */}
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, 
          gap: 3, 
          mb: 4 
        }}>
          <MDStatsCard
            title="TOTAL BACKEND RECORDS"
            value={`${serverStats.totalCount} Tickets`}
            icon={<CheckCircleIcon />}
            iconBgColor="success.light"
            iconColor="success.main"
            subtitle={`Source: ${serverStats.dataSource}`}
          />
          <MDStatsCard
            title="COMPLETED TICKETS"
            value={`${serverStats.completedCount} / ${serverStats.totalCount} Slices`}
            icon={<ScheduleIcon />}
            iconBgColor="info.light"
            iconColor="info.main"
            subtitle="Live status distribution model"
          />
          <MDStatsCard
            title="DATABASE AVG PROGRESS"
            value={`${serverStats.avgProgress}% Completion`}
            icon={<CachedIcon />}
            iconBgColor="warning.light"
            iconColor="warning.main"
            subtitle="Aggregate database weight indices"
          />
        </Box>

        {/* Workspace Display Navigation */}
        <Card sx={{ mb: 4, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <Tabs 
            value={activeView} 
            onChange={(_, val) => setActiveView(val)}
            sx={{
              borderBottom: "1px solid #ddd",
              px: 2,
              "& .MuiTab-root": { fontWeight: "bold", textTransform: "none", fontSize: "14px", py: 2 }
            }}
          >
            <Tab label="1. Client-Side (Automatic) Table" />
            <Tab label="2. Server-Side (Manual, Cursor) Table" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeView === 0 ? (
              <Box>
                {/* Visual Tips alerting the design philosophy */}
                <Box sx={{ bgcolor: "#EAFCFC", p: 2, borderRadius: "8px", display: "flex", gap: 1.5, mb: 3, border: "1px solid #b2ebf2" }}>
                  <InfoIcon color="info" fontSize="small" sx={{ mt: 0.25 }} />
                  <Box>
                    <MDTypography variant="button" fontWeight="bold" sx={{ color: "#006064" }}>
                      Automatic Processing Mode
                    </MDTypography>
                    <MDTypography variant="caption" color="textSecondary">
                      All data rows are loaded concurrently into browser memory. Client-side controllers support fast searches, density toggles, multi-row selections, and custom mutations without incurring downstream server latency.
                    </MDTypography>
                  </Box>
                </Box>

                <MDAutomaticTable
                  title="Ticket Indices - Automatic Table"
                  data={localItems}
                  columns={columns}
                  loading={isAutomaticLoading}
                  onUpdate={handleUpdateAutomatic}
                  enableRowSelection={true}
                  rowSelectionActions={selectedRowActions}
                  localStorageKey="automatic-playground"
                />
              </Box>
            ) : (
              <Box>
                <Box sx={{ bgcolor: "#FFF4E5", p: 2, borderRadius: "8px", display: "flex", gap: 1.5, mb: 3, border: "1px solid #ffe0b2" }}>
                  <InfoIcon color="warning" fontSize="small" sx={{ mt: 0.25 }} />
                  <Box>
                    <MDTypography variant="button" fontWeight="bold" sx={{ color: "#e65100" }}>
                      Real Server Pagination Mode
                    </MDTypography>
                    <MDTypography variant="caption" color="textSecondary">
                      Loads data from a live Express REST backend server. The server computes standard cursor keys (`cursor-5`, `cursor-10`) relative to active filters and returns standard paginated slices. All text searches below execute filters on the backend database automatically!
                    </MDTypography>
                  </Box>
                </Box>

                <MDManualTable
                  title="Live Express API Output - Manual Table"
                  data={manualData}
                  columns={columns}
                  loading={isManualLoading || isManualFetching}
                  onUpdate={handleUpdateManual}
                  pagination={manualPagination}
                  setPagination={setManualPagination}
                  hasMoreData={manualHasNextPage}
                  manualFiltering={true}
                  columnFilters={serverSearchQuery}
                  setColumnFilters={setServerSearchQuery}
                  enableDownload={true}
                  localStorageKey="manual-playground"
                />
              </Box>
            )}
          </Box>
        </Card>



      </Container>

      {/* Snackbar alerts */}
      <Snackbar
        open={alertState.open}
        autoHideDuration={4000}
        onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setAlertState(prev => ({ ...prev, open: false }))} 
          severity={alertState.severity} 
          sx={{ width: "100%", fontWeight: "medium", borderRadius: "8px" }}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </MDBox>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainDashboard />
    </QueryClientProvider>
  );
}
