import React, { useState, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  Container,
  Card,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  AutoAwesome as AutoAwesomeIcon,
  Cached as CachedIcon,
  PlaylistAdd as PlaylistAddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

import MDBox from "./components/MDBox";
import MDTypography from "./components/MDTypography";
import MDButton from "./components/MDButton";
import MDAlert from "./components/MDAlert";

import MDAutomaticTable from "./components/MDAutomaticTable";
import MDManualTable from "./components/MDManualTable";
import MDStatsCard from "./components/MDStatsCard";

import { usePaginatedItems } from "./hooks/usePaginatedItems";
import { ApiService } from "./backend/apiService";

import { ItemEntity, ColumnDef } from "./types";

const queryClient = new QueryClient();

function MainDashboard() {
  const [activeView, setActiveView] = useState<number>(0);

  const [localItems, setLocalItems] = useState<ItemEntity[]>([]);

  const [isAutomaticLoading, setIsAutomaticLoading] = useState<boolean>(false);

  const [serverStats, setServerStats] = useState({
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    activeCount: 0,
    avgProgress: 0,
    dataSource: "Syncing...",
  });

  const [alertState, setAlertState] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [serverSearchQuery, setServerSearchQuery] = useState("");

  const [manualTriggerVal] = useState(0);

  const triggerAlert = (
    message: string,
    severity: "success" | "info" | "warning" = "success",
  ) => {
    setAlertState({
      open: true,
      message,
      severity,
    });
  };

  const syncAllData = async () => {
    setIsAutomaticLoading(true);

    try {
      const list = await ApiService.fetchAllItems();

      setLocalItems(list);

      const stats = await ApiService.fetchStats();

      setServerStats({
        totalCount: stats.totalCount,
        completedCount: stats.completedCount,
        pendingCount: stats.pendingCount,
        activeCount: stats.activeCount,
        avgProgress: stats.avgProgress,
        dataSource: stats.dataSource || "In-Memory Core Cache",
      });
    } catch (err: any) {
      triggerAlert(err?.message || "Failed to sync with API server", "warning");
    } finally {
      setIsAutomaticLoading(false);
    }
  };

  React.useEffect(() => {
    syncAllData();
  }, [activeView]);

  const handleAddNewItem = async () => {
    const payload: Partial<ItemEntity> = {
      title: "New ticket added to live Express backend database",
      category: "Engineering",
      priority: Math.random() > 0.5 ? "High" : "Low",
      status: "Pending",
      assignedTo: "Sarah Connor",
      progress: 0,
    };

    try {
      const created = await ApiService.createItem(payload);

      triggerAlert(`Created item ${created.id} successfully!`, "success");

      await syncAllData();

      refetchManualServer();
    } catch (err: any) {
      triggerAlert(err?.message || "POST transaction failed", "warning");
    }
  };

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
      ApiService.fetchItems(index, limit, cursorKey, serverSearchQuery),
  });

  const columns: ColumnDef<ItemEntity>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Ticket ID",

        cell: ({ getValue }) => (
          <MDTypography
            variant="button"
            fontWeight="bold"
            sx={{
              color: "primary.main",
              fontFamily: "var(--font-mono)",
            }}
          >
            {getValue()}
          </MDTypography>
        ),
      },

      {
        accessorKey: "title",
        header: "Title",

        cell: ({ getValue, row }) => {
          const priority = row.original.priority;

          const dotColor =
            priority === "High"
              ? "#f44336"
              : priority === "Medium"
                ? "#ffa726"
                : "#26c6da";

          return (
            <MDBox
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <MDTypography
                variant="button"
                fontWeight="medium"
                sx={{
                  color: "#344767",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <MDBox
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: dotColor,
                    display: "inline-block",
                  }}
                />

                {getValue()}
              </MDTypography>

              <MDTypography variant="caption" color="textSecondary">
                Assigned to:
                <strong> {row.original.assignedTo}</strong>
              </MDTypography>
            </MDBox>
          );
        },
      },

      {
        accessorKey: "category",
        header: "Category",

        cell: ({ getValue }) => (
          <Chip
            label={getValue()}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: "11px",
              height: "20px",
            }}
          />
        ),
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
              sx={{
                fontWeight: "bold",
                fontSize: "10px",
                height: "20px",
              }}
            />
          );
        },
      },

      {
        accessorKey: "progress",
        header: "Progress",

        cell: ({ getValue }) => {
          const val = Number(getValue());

          return (
            <MDBox
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                width: 100,
              }}
            >
              <MDTypography
                variant="button"
                fontWeight="medium"
                color="textSecondary"
              >
                {val}%
              </MDTypography>

              <LinearProgress
                variant="determinate"
                value={val}
                sx={{
                  flexGrow: 1,
                  height: 4,
                  borderRadius: 2,
                }}
              />
            </MDBox>
          );
        },
      },

      {
        accessorKey: "updatedAt",
        header: "Last Update",

        cell: ({ getValue }) => {
          const d = new Date(getValue());

          return (
            <MDTypography
              variant="caption"
              color="textSecondary"
              sx={{
                fontFamily: "var(--font-mono)",
              }}
            >
              {d.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </MDTypography>
          );
        },
      },
    ],
    [],
  );

  const selectedRowActions = useMemo(
    () => [
      {
        label: "Assign to Me",
        variant: "outlined" as const,
        color: "primary" as const,
        disabled: false,
        icon: "person",

        onClick: async (selectedItems: ItemEntity[]) => {
          const ids = selectedItems.map((item) => item.id);

          try {
            await ApiService.bulkAssign(ids, "Current User");

            triggerAlert(`Assigned ${ids.length} ticket(s)!`, "success");

            await syncAllData();

            refetchManualServer();
          } catch (err: any) {
            triggerAlert(err?.message || "Assignment failed", "warning");
          }
        },
      },

      {
        label: "Complete Selected",
        variant: "contained" as const,
        color: "success" as const,
        disabled: false,
        icon: "check_circle",

        onClick: async (selectedItems: ItemEntity[]) => {
          const ids = selectedItems.map((item) => item.id);

          try {
            await ApiService.bulkComplete(ids);

            triggerAlert(`Completed ${ids.length} ticket(s)!`, "success");

            await syncAllData();

            refetchManualServer();
          } catch (err: any) {
            triggerAlert(err?.message || "Completion failed", "warning");
          }
        },
      },
    ],
    [],
  );

  const handleUpdateAutomatic = () => {
    syncAllData().then(() => {
      triggerAlert("Automatic table refreshed!", "success");
    });
  };

  const handleUpdateManual = () => {
    refetchManualServer();

    triggerAlert("Manual table refetched!", "info");
  };

  return (
    <MDBox
      sx={{
        backgroundColor: "#F4F6F9",
        minHeight: "100vh",
        pb: 8,
      }}
    >
      <MDBox
        bgColor="#1C1F26"
        sx={{
          color: "#FFF",
          py: 5,
          mb: 4,
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <Container maxWidth="lg">
          <MDBox
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                md: "row",
              },
              justifyContent: "space-between",
              alignItems: {
                xs: "stretch",
                md: "center",
              },
              gap: 3,
            }}
          >
            <MDBox>
              <MDBox
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 36,
                    height: 36,
                  }}
                >
                  <AutoAwesomeIcon fontSize="small" />
                </Avatar>

                <Chip
                  label="Enterprise Ready"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "#FFF",
                    fontWeight: "bold",
                  }}
                />
              </MDBox>

              <MDTypography variant="h3" fontWeight="bold">
                MUI Data Tables & Pagination Center
              </MDTypography>

              <MDTypography
                variant="subtitle1"
                sx={{
                  opacity: 0.82,
                  mt: 0.5,
                }}
              >
                Interactive automatic vs manual pagination dashboard built with
                React, TypeScript, React Query and Material UI.
              </MDTypography>
            </MDBox>

            <MDButton
              variant="contained"
              color="primary"
              startIcon={<PlaylistAddIcon />}
              onClick={handleAddNewItem}
              sx={{
                backgroundColor: "#2E66E5",

                "&:hover": {
                  backgroundColor: "#1e4bb2",
                },

                px: 3,
                py: 1.2,
                fontWeight: "bold",
              }}
            >
              Insert Live Task
            </MDButton>
          </MDBox>
        </Container>
      </MDBox>

      <Container maxWidth="lg">
        <MDBox
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
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
            value={`${serverStats.completedCount} / ${serverStats.totalCount}`}
            icon={<ScheduleIcon />}
            iconBgColor="info.light"
            iconColor="info.main"
            subtitle="Live status distribution"
          />

          <MDStatsCard
            title="DATABASE AVG PROGRESS"
            value={`${serverStats.avgProgress}% Completion`}
            icon={<CachedIcon />}
            iconBgColor="warning.light"
            iconColor="warning.main"
            subtitle="Aggregate metrics"
          />
        </MDBox>

        <Card
          sx={{
            mb: 4,
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <Tabs
            value={activeView}
            onChange={(_, val) => setActiveView(val)}
            sx={{
              borderBottom: "1px solid #ddd",
              px: 2,

              "& .MuiTab-root": {
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "14px",
                py: 2,
              },
            }}
          >
            <Tab label="1. Client-Side Table" />

            <Tab label="2. Server-Side Table" />
          </Tabs>

          <MDBox sx={{ p: 3 }}>
            {activeView === 0 ? (
              <MDBox>
                <MDAlert
                  severity="info"
                  title="Automatic Processing Mode"
                  description="
                  All data rows are loaded into browser memory.
                  Fast local filtering, searching and mutations
                  happen without server latency.
                "
                  sx={{ mb: 3 }}
                />

                <MDAutomaticTable
                  title="Automatic Table"
                  data={localItems}
                  columns={columns}
                  loading={isAutomaticLoading}
                  onUpdate={handleUpdateAutomatic}
                  enableRowSelection
                  rowSelectionActions={selectedRowActions}
                  localStorageKey="automatic-playground"
                />
              </MDBox>
            ) : (
              <MDBox>
                <MDAlert
                  severity="warning"
                  title="Real Server Pagination Mode"
                  description="
                  Data is fetched directly from the backend API
                  using cursor pagination and server-side filtering.
                "
                  sx={{ mb: 3 }}
                />

                <MDManualTable
                  title="Manual Server Table"
                  data={manualData}
                  columns={columns}
                  loading={isManualLoading || isManualFetching}
                  onUpdate={handleUpdateManual}
                  pagination={manualPagination}
                  setPagination={setManualPagination}
                  hasMoreData={manualHasNextPage}
                  manualFiltering
                  columnFilters={serverSearchQuery}
                  setColumnFilters={setServerSearchQuery}
                  enableDownload
                  localStorageKey="manual-playground"
                />
              </MDBox>
            )}
          </MDBox>
        </Card>
      </Container>

      <Snackbar
        open={alertState.open}
        autoHideDuration={4000}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        onClose={() =>
          setAlertState((prev) => ({
            ...prev,
            open: false,
          }))
        }
      >
        <Alert
          severity={alertState.severity}
          onClose={() =>
            setAlertState((prev) => ({
              ...prev,
              open: false,
            }))
          }
          sx={{
            width: "100%",
            borderRadius: 2,
          }}
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
