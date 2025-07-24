import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/dark.css";
import { Bar, Line } from "react-chartjs-2";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Stack,
  Divider,
  Avatar,
  ThemeProvider,
  createTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Chart as Graph,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { styled } from "@mui/material/styles";
import {
  Memory as MemoryIcon,
  Computer as ComputerIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Dashboard as DashboardIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material";

// Register Chart.js components once
Graph.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend
);

// Constants
const API_ENDPOINTS = {
  FILTERED: "http://localhost:9000/api/zabbix/all-utilizations-v3",
  UNFILTERED: "http://localhost:9000/api/zabbix/all-utilizations-v2",
  LATEST: "http://localhost:9000/api/zabbix/latest-utilizations",
};

const FILTER_OPTIONS = [
  "Yesterday",
  "Last 2 Days",
  "Last 7 Days",
  "This Month",
  "Last 3 Months",
  "Last 6 Months",
  "This Year",
  "Custom",
];

const CHART_TYPES = {
  LINE: "line",
  BAR: "bar",
  COMBO: "combo",
  STACKED: "stacked",
};

const SEVERITY_THRESHOLDS = {
  CPU: { HIGH: 80, MEDIUM: 60 },
  MEMORY: { HIGH: 85, MEDIUM: 70 },
  DISK: { HIGH: 85, MEDIUM: 70 },
};

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3b82f6", light: "#60a5fa", dark: "#1e40af" },
    secondary: { main: "#8b5cf6", light: "#a78bfa", dark: "#7c3aed" },
    background: { default: "#0f172a", paper: "#1e293b" },
    surface: { main: "#334155", light: "#475569", dark: "#1e293b" },
    text: { primary: "#f8fafc", secondary: "#cbd5e1" },
    divider: "#334155",
    success: { main: "#10b981", light: "#34d399", dark: "#059669" },
    warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
    error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.025em" },
    h2: { fontWeight: 700, letterSpacing: "-0.025em" },
    h3: { fontWeight: 600, letterSpacing: "-0.025em" },
    h4: { fontWeight: 600, letterSpacing: "-0.025em" },
    h5: { fontWeight: 600, letterSpacing: "-0.025em" },
    h6: { fontWeight: 600, letterSpacing: "-0.025em" },
    body1: { fontWeight: 400, letterSpacing: "-0.01em" },
    body2: { fontWeight: 400, letterSpacing: "-0.01em" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});

// Styled components
const ProfessionalCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease-in-out",
  height: "100%",
  minHeight: "500px",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    transform: "translateY(-4px)",
    boxShadow: `0 12px 32px -8px ${theme.palette.primary.main}30`,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.8,
  },
}));

const StatusChip = styled(Chip)(({ theme, severity }) => {
  const getColor = () => {
    switch (severity) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      default:
        return theme.palette.success.main;
    }
  };

  return {
    backgroundColor: `${getColor()}15`,
    color: getColor(),
    border: `1px solid ${getColor()}30`,
    fontWeight: 600,
    fontSize: "0.75rem",
    height: "28px",
    borderRadius: "14px",
  };
});

const MetricCard = styled(Paper)(({ theme, severity }) => {
  const getColor = () => {
    switch (severity) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      default:
        return theme.palette.success.main;
    }
  };

  return {
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.surface.dark} 100%)`,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    textAlign: "left",
    transition: "all 0.3s ease-in-out",
    cursor: "pointer",
    minHeight: "90px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(2),
    "&:hover": {
      borderColor: getColor(),
      transform: "scale(1.02)",
      boxShadow: `0 8px 24px -4px ${getColor()}25`,
      background: `linear-gradient(135deg, ${theme.palette.surface.dark} 0%, ${theme.palette.background.paper} 100%)`,
    },
  };
});

const MetricIconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)`,
  border: `1px solid ${theme.palette.divider}`,
}));

const DashboardHeader = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.surface.dark} 100%)`,
}));

const StyledFlatpickrWrapper = styled(Box)(({ theme }) => ({
  "& .flatpickr-input": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: "8px 12px",
    fontSize: "0.875rem",
    width: "220px",
    outline: "none",
    "&:hover": { borderColor: theme.palette.primary.main },
    "&:focus": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
    },
  },
}));

// Utility functions
const isValidDateRange = (dateRange) => {
  return (
    dateRange &&
    Array.isArray(dateRange) &&
    dateRange.length === 2 &&
    dateRange[0] &&
    dateRange[1] &&
    dateRange[0] instanceof Date &&
    dateRange[1] instanceof Date
  );
};

const getSeverity = (value, type) => {
  const thresholds =
    SEVERITY_THRESHOLDS[type.toUpperCase()] || SEVERITY_THRESHOLDS.CPU;
  if (value > thresholds.HIGH) return "high";
  if (value > thresholds.MEDIUM) return "medium";
  return "low";
};

const getValue = (dataPoint, isFiltered) => {
  if (isFiltered) {
    return dataPoint.value_avg ? parseFloat(dataPoint.value_avg) : 0;
  }
  return dataPoint.value ? parseFloat(dataPoint.value) : 0;
};

// Custom hooks
const useDateRange = (filterType, customDateRange) => {
  return useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    endDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    switch (filterType) {
      case "Yesterday":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "Last 2 Days":
        startDate.setDate(endDate.getDate() - 2);
        break;
      case "Last 7 Days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "This Month":
        startDate.setDate(1);
        break;
      case "Last 3 Months":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "Last 6 Months":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "This Year":
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      case "Custom":
        if (isValidDateRange(customDateRange)) {
          const customStart = new Date(customDateRange[0]);
          const customEnd = new Date(customDateRange[1]);
          customStart.setHours(0, 0, 0, 0);
          customEnd.setHours(0, 0, 0, 0);
          return [customStart, customEnd];
        }
        return null;
      default:
        startDate.setDate(endDate.getDate() - 1);
    }
    return [startDate, endDate];
  }, [filterType, customDateRange]);
};

const useChartOptions = (chartType) => {
  return useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyle: "circle",
            font: { family: '"Inter", sans-serif', size: 12, weight: 500 },
            color: "#cbd5e1",
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#1e293b",
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          borderColor: "#334155",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: (context) => `Time: ${context[0]?.label}`,
            label: (context) =>
              `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: chartType === CHART_TYPES.STACKED ? 300 : 100,
          grid: { color: "#334155", lineWidth: 1 },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
            callback: (value) => value + "%",
          },
          border: { display: false },
          stacked: chartType === CHART_TYPES.STACKED,
        },
        x: {
          grid: { display: false },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
            maxRotation: 45,
            callback: function (value, index) {
              return this.getLabelForValue(index) || "";
            },
          },
          border: { display: false },
          stacked: chartType === CHART_TYPES.STACKED,
        },
      },
      interaction: { mode: "index", intersect: false },
    }),
    [chartType]
  );
};

// Component for individual metric display
const MetricDisplay = React.memo(({ value, trend, label, icon, color }) => (
  <MetricCard elevation={0} severity={getSeverity(value, label.toLowerCase())}>
    <MetricIconWrapper>
      {React.cloneElement(icon, { sx: { fontSize: 24, color } })}
    </MetricIconWrapper>
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color, lineHeight: 1.2 }}
        >
          {value.toFixed(1)}%
        </Typography>
        {trend === "up" ? (
          <ArrowUpIcon sx={{ fontSize: 16, color: "warning.main" }} />
        ) : (
          <ArrowDownIcon sx={{ fontSize: 16, color: "success.main" }} />
        )}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        {label}
      </Typography>
    </Box>
  </MetricCard>
));

// Main component
const HostDashboard = () => {
  const [hostsData, setHostsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState(CHART_TYPES.BAR);
  const [filterStatus, setFilterStatus] = useState("off");
  const [filterType, setFilterType] = useState("Yesterday");
  const [customDateRange, setCustomDateRange] = useState([
    new Date(new Date().setDate(new Date().getDate() - 1)),
    new Date(),
  ]);

  const dateRange = useDateRange(filterType, customDateRange);
  const chartOptions = useChartOptions(chartType);

  // Generate dynamic labels for charts
  const generateDynamicLabels = useCallback((dataArray, dataLength) => {
    const labels = dataArray.map((data) =>
      new Date(data.clock).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      })
    );

    let maxLabelsToShow;
    if (dataLength <= 6) maxLabelsToShow = dataLength;
    else if (dataLength <= 12) maxLabelsToShow = 6;
    else if (dataLength <= 24) maxLabelsToShow = 8;
    else if (dataLength <= 48) maxLabelsToShow = 10;
    else maxLabelsToShow = 12;

    const step = Math.ceil(dataLength / maxLabelsToShow);

    return labels.map((label, index) => {
      if (index === 0 || index === dataLength - 1 || index % step === 0) {
        return label;
      }
      return "";
    });
  }, []);

  // Get latest statistics for a host
  const getLatestStats = useCallback(
    (host) => {
      const isFiltered = filterStatus === "on";

      const latestCpu =
        host.cpu.length > 0
          ? getValue(host.cpu[host.cpu.length - 1], isFiltered)
          : 0;
      const latestMemory =
        host.memory.length > 0
          ? getValue(host.memory[host.memory.length - 1], isFiltered)
          : 0;
      const latestDisk =
        host.disk.length > 0
          ? getValue(host.disk[host.disk.length - 1], isFiltered)
          : 0;

      const prevCpu =
        host.cpu.length > 1
          ? getValue(host.cpu[host.cpu.length - 2], isFiltered)
          : 0;
      const prevMemory =
        host.memory.length > 1
          ? getValue(host.memory[host.memory.length - 2], isFiltered)
          : 0;
      const prevDisk =
        host.disk.length > 1
          ? getValue(host.disk[host.disk.length - 2], isFiltered)
          : 0;

      return {
        latestCpu,
        latestMemory,
        latestDisk,
        cpuTrend: latestCpu >= prevCpu ? "up" : "down",
        memoryTrend: latestMemory >= prevMemory ? "up" : "down",
        diskTrend: latestDisk >= prevDisk ? "up" : "down",
      };
    },
    [filterStatus]
  );

  // Generate chart data
  const getChartData = useCallback(
    (host) => {
      const isFiltered = filterStatus === "on";
      const dataLength = Math.max(
        host.cpu.length,
        host.memory.length,
        host.disk.length
      );
      const sliceLength = isFiltered ? dataLength : 20;

      const primaryDataArray =
        host.cpu.length >= host.memory.length &&
        host.cpu.length >= host.disk.length
          ? host.cpu
          : host.memory.length >= host.disk.length
          ? host.memory
          : host.disk;

      const slicedDataArray = primaryDataArray.slice(-sliceLength);
      const actualDataLength = slicedDataArray.length;
      const dynamicLabels = generateDynamicLabels(
        slicedDataArray,
        actualDataLength
      );

      const isStacked = chartType === CHART_TYPES.STACKED;
      const isCombo = chartType === CHART_TYPES.COMBO;

      return {
        labels: dynamicLabels,
        datasets: [
          {
            label: "CPU Usage",
            data: host.cpu
              .map((data) => getValue(data, isFiltered))
              .slice(-sliceLength),
            backgroundColor: isCombo ? "rgba(59, 130, 246, 0.5)" : "#3b82f6",
            borderColor: "#1e40af",
            borderWidth: isCombo ? 2 : 1,
            type: isCombo
              ? "line"
              : chartType === CHART_TYPES.LINE
              ? "line"
              : "bar",
            fill: isCombo,
            tension: isCombo ? 0.4 : 0,
            pointRadius: isCombo ? 3 : 0,
            pointHoverRadius: isCombo ? 6 : 0,
            pointBackgroundColor: isCombo ? "#3b82f6" : undefined,
            pointBorderColor: isCombo ? "#1e293b" : undefined,
            pointBorderWidth: isCombo ? 2 : 0,
            stack: isStacked ? "stack" : undefined,
            order: isCombo ? 0 : 1,
          },
          {
            label: "Memory Usage",
            data: host.memory
              .map((data) => getValue(data, isFiltered))
              .slice(-sliceLength),
            backgroundColor: isCombo ? "rgba(139, 92, 246, 0.5)" : "#8b5cf6",
            borderColor: "#7c3aed",
            borderWidth: isCombo ? 2 : 1,
            type: isCombo
              ? "line"
              : chartType === CHART_TYPES.LINE
              ? "line"
              : "bar",
            fill: isCombo,
            tension: isCombo ? 0.4 : 0,
            pointRadius: isCombo ? 3 : 0,
            pointHoverRadius: isCombo ? 6 : 0,
            pointBackgroundColor: isCombo ? "#8b5cf6" : undefined,
            pointBorderColor: isCombo ? "#1e293b" : undefined,
            pointBorderWidth: isCombo ? 2 : 0,
            stack: isStacked ? "stack" : undefined,
            order: isCombo ? 0 : 1,
          },
          {
            label: "Disk Usage",
            data: host.disk
              .map((data) => getValue(data, isFiltered))
              .slice(-sliceLength),
            backgroundColor: isCombo ? "#10b981" : "#10b981",
            borderColor: "#059669",
            borderWidth: 1,
            type: chartType === CHART_TYPES.LINE ? "line" : "bar",
            fill: false,
            tension: chartType === CHART_TYPES.LINE ? 0.4 : 0,
            pointRadius: chartType === CHART_TYPES.LINE ? 3 : 0,
            pointHoverRadius: chartType === CHART_TYPES.LINE ? 6 : 0,
            pointBackgroundColor:
              chartType === CHART_TYPES.LINE ? "#10b981" : undefined,
            pointBorderColor:
              chartType === CHART_TYPES.LINE ? "#1e293b" : undefined,
            pointBorderWidth: chartType === CHART_TYPES.LINE ? 2 : 0,
            stack: isStacked ? "stack" : undefined,
            order: 1,
          },
        ],
      };
    },
    [chartType, filterStatus, generateDynamicLabels]
  );

  // API functions
  const fetchUtilizations = useCallback(async () => {
    try {
      if (!loading) setChartLoading(true);

      const payload = { filterStatus };
      let apiEndpoint;

      if (filterStatus === "on") {
        if (filterType === "Custom" && !dateRange) {
          console.log(
            "Invalid date range for custom filter, skipping API call"
          );
          setChartLoading(false);
          return;
        }

        const [start, end] = dateRange;
        payload.startDate = start.toISOString();
        payload.endDate = end.toISOString();
        apiEndpoint = API_ENDPOINTS.FILTERED;
      } else {
        apiEndpoint = API_ENDPOINTS.UNFILTERED;
      }

      const response = await axios.post(apiEndpoint, payload);

      console.log("response----------->", response);
      
      // Check if response.data contains an error
      if (response.data.error) {
        setError(response.data.error);
        setHostsData([]);
        setLoading(false);
        setChartLoading(false);
        return;
      }

      // Process successful response
      const reversedData = response.data.map((host) => ({
        ...host,
        cpu:
          filterStatus === "off"
            ? host.cpu.reverse().slice(0, 20)
            : host.cpu.reverse(),
        memory:
          filterStatus === "off"
            ? host.memory.reverse().slice(0, 20)
            : host.memory.reverse(),
        disk:
          filterStatus === "off"
            ? host.disk.reverse().slice(0, 20)
            : host.disk.reverse(),
      }));

      setHostsData(reversedData);
      setError(null); // Clear any previous errors
      setLoading(false);
      setChartLoading(false);
    } catch (err) {
      console.log("err-------------->", err);
      setError(
        err.response?.data?.error ||
        "Failed to fetch host utilization data"
      );
      setHostsData([]);
      setLoading(false);
      setChartLoading(false);
      console.error("Error fetching utilizations:", err);
    }
  }, [filterStatus, filterType, dateRange, loading]);

  const fetchLatestUtilizations = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await axios.post(API_ENDPOINTS.LATEST, {});

      // Check if response.data contains an error
      if (response.data.error) {
        setError(response.data.error);
        setRefreshing(false);
        return;
      }

      setHostsData((prevData) => {
        return response.data.map((newHost) => {
          const existingHost = prevData.find(
            (h) => h.hostid === newHost.hostid
          ) || {
            cpu: [],
            memory: [],
            disk: [],
            hostname: newHost.hostname,
            hostid: newHost.hostid,
          };

          return {
            ...newHost,
            cpu: [...existingHost.cpu, ...(newHost.cpu || [])].slice(-20),
            memory: [...existingHost.memory, ...(newHost.memory || [])].slice(
              -20
            ),
            disk: [...existingHost.disk, ...(newHost.disk || [])].slice(-20),
          };
        });
      });
      setError(null); // Clear any previous errors
      setRefreshing(false);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Failed to fetch latest host utilization data"
      );
      setRefreshing(false);
      console.error("Error fetching latest utilizations:", err);
    }
  }, []);

  // Event handlers
  const handleChartTypeChange = useCallback((event) => {
    setChartType(event.target.value);
  }, []);

  const handleFilterStatusChange = useCallback((event) => {
    setFilterStatus(event.target.value);
    if (event.target.value === "off") {
      setFilterType("Yesterday");
      setCustomDateRange([
        new Date(new Date().setDate(new Date().getDate() - 1)),
        new Date(),
      ]);
    }
  }, []);

  const handleFilterTypeChange = useCallback((event) => {
    setFilterType(event.target.value);
  }, []);

  const handleCustomDateChange = useCallback((dates) => {
    setCustomDateRange(dates);
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setError(null);
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchUtilizations();
    let intervalId;
    if (filterStatus === "off") {
      intervalId = setInterval(fetchLatestUtilizations, 60000);
    }
    return () => clearInterval(intervalId);
  }, [fetchUtilizations, fetchLatestUtilizations, filterStatus]);

  // Memoized computed values
  const validHosts = useMemo(
    () => hostsData.filter((host) => !host.error),
    [hostsData]
  );
  const isApplyDisabled =
    filterType === "Custom" && !isValidDateRange(customDateRange);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          color: "text.primary",
          padding: { xs: 2, md: 3 },
        }}
      >
        <Container maxWidth="xl">
          <DashboardHeader>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 56,
                    height: 56,
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    HostSniper Surveillance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Real-time system performance analytics
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    onChange={handleChartTypeChange}
                    label="Chart Type"
                  >
                    <MenuItem value={CHART_TYPES.LINE}>Line</MenuItem>
                    <MenuItem value={CHART_TYPES.BAR}>Bar</MenuItem>
                    <MenuItem value={CHART_TYPES.COMBO}>
                      Combo Bar/Line
                    </MenuItem>
                    <MenuItem value={CHART_TYPES.STACKED}>
                      Stacked Bar/Line
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <InputLabel>Filter Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={handleFilterStatusChange}
                    label="Filter Status"
                  >
                    <MenuItem value="off">Off</MenuItem>
                    <MenuItem value="on">On</MenuItem>
                  </Select>
                </FormControl>

                {filterStatus === "on" && (
                  <>
                    <FormControl
                      variant="outlined"
                      size="small"
                      sx={{ minWidth: 150 }}
                    >
                      <InputLabel>Filter Type</InputLabel>
                      <Select
                        value={filterType}
                        onChange={handleFilterTypeChange}
                        label="Filter Type"
                      >
                        {FILTER_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {filterType === "Custom" && (
                      <StyledFlatpickrWrapper>
                        <Flatpickr
                          value={customDateRange}
                          onChange={handleCustomDateChange}
                          options={{
                            mode: "range",
                            dateFormat: "Y-m-d",
                            maxDate: new Date(),
                            theme: "dark",
                            allowInput: true,
                            clickOpens: true,
                            closeOnSelect: false,
                          }}
                          placeholder="Select date range"
                          className="flatpickr-input"
                        />
                      </StyledFlatpickrWrapper>
                    )}
                  </>
                )}
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Last updated:{" "}
              {new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
              {filterStatus === "on" && ` • Filter: ${filterType}`}
              {filterType === "Custom" &&
                isValidDateRange(customDateRange) &&
                ` (${customDateRange[0].toLocaleDateString()} - ${customDateRange[1].toLocaleDateString()})`}
            </Typography>
          </DashboardHeader>

          {loading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
              }}
            >
              <CircularProgress size={56} thickness={3} sx={{ mb: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Loading System Monitor data...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                maxWidth: 700,
                mx: "auto",
                borderRadius: 2,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
              icon={<ErrorIcon />}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {error}
              </Typography>
            </Alert>
          )}

          {!loading && !error && validHosts.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
              }}
            >
              <WarningIcon
                sx={{
                  fontSize: 48,
                  color: "warning.main",
                  mb: 2,
                  opacity: 0.7,
                }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "warning.main" }}
              >
                No Hosts Available
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No host data found for the selected period
              </Typography>
            </Box>
          )}

          {!loading && !error && validHosts.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
                maxWidth: "1400px",
                mx: "auto",
              }}
            >
              {validHosts.map((host, index) => {
                const stats = getLatestStats(host);
                const maxUsage = Math.max(
                  stats.latestCpu,
                  stats.latestMemory,
                  stats.latestDisk
                );
                const overallSeverity = getSeverity(maxUsage, "cpu");

                return (
                  <ProfessionalCard key={host.hostid}>
                    <Box sx={{ p: 3, pb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "transparent",
                              border: "2px solid",
                              borderColor: "primary.main",
                              color: "primary.main",
                              width: 44,
                              height: 44,
                            }}
                          >
                            <ComputerIcon fontSize="medium" />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, mb: 0.5 }}
                            >
                              {host.hostname}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Host ID: {host.hostid} • Position: {index + 1}
                            </Typography>
                          </Box>
                        </Box>
                        <StatusChip
                          label={`${maxUsage.toFixed(1)}%`}
                          severity={overallSeverity}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <CardContent
                      sx={{ flexGrow: 1, pt: 0, pb: 2, position: "relative" }}
                    >
                      {chartLoading && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            zIndex: 1,
                          }}
                        >
                          <CircularProgress size={32} thickness={4} />
                        </Box>
                      )}

                      {host.cpu.length > 0 ||
                      host.memory.length > 0 ||
                      host.disk.length > 0 ? (
                        <Box sx={{ height: 280, width: "100%" }}>
                          {chartType === CHART_TYPES.LINE ? (
                            <Line
                              data={getChartData(host)}
                              options={chartOptions}
                            />
                          ) : (
                            <Bar
                              data={getChartData(host)}
                              options={chartOptions}
                            />
                          )}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            height: 280,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "background.default",
                            borderRadius: 2,
                            border: `1px dashed ${darkTheme.palette.divider}`,
                          }}
                        >
                          <WarningIcon
                            sx={{
                              fontSize: 48,
                              color: "warning.main",
                              mb: 2,
                              opacity: 0.7,
                            }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "warning.main" }}
                          >
                            No Data Available
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            Waiting for metrics to be collected
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    <Box
                      sx={{ p: 2, pt: 1, backgroundColor: "background.paper" }}
                    >
                      <Grid
                        container
                        spacing={1.5}
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Grid item xs={4}>
                          <MetricDisplay
                            value={stats.latestCpu}
                            trend={stats.cpuTrend}
                            label="CPU Usage"
                            icon={<SpeedIcon />}
                            color="#3b82f6"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <MetricDisplay
                            value={stats.latestMemory}
                            trend={stats.memoryTrend}
                            label="Memory Usage"
                            icon={<MemoryIcon />}
                            color="#8b5cf6"
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <MetricDisplay
                            value={stats.latestDisk}
                            trend={stats.diskTrend}
                            label="Storage Usage"
                            icon={<StorageIcon />}
                            color="#10b981"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </ProfessionalCard>
                );
              })}
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default HostDashboard;