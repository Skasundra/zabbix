import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  TablePagination,
  Avatar,
  Fade,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Computer as ComputerIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  BugReport as BugReportIcon,
  Storage as StorageIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Styled components (same as original)
const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 4),
  minHeight: "100vh",
  backgroundColor: "#0f172a",
  color: theme.palette.text.primary,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
  overflow: "hidden",
  width: "100%",
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(2),
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: "180px",
  minWidth: "240px",
  flex: 1,
  borderRadius: theme.shape.borderRadius,
  background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  transition: "all 0.3s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
  },
  [theme.breakpoints.down("md")]: {
    minWidth: "200px",
    height: "150px",
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: "100%",
    height: "120px",
  },
}));

const StatsGridContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: theme.spacing(1.5),
  },
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
    gap: theme.spacing(1),
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.contrastText,
  fontSize: "0.9rem",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  padding: theme.spacing(1.5),
  whiteSpace: "nowrap",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
    padding: theme.spacing(1),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "rgba(30, 41, 59, 0.5)",
  "&:nth-of-type(odd)": {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
  },
  "&:hover": {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  transition: "all 0.2s ease-in-out",
  [theme.breakpoints.down("sm")]: {
    display: "block",
    padding: theme.spacing(1),
    "& > td": {
      display: "block",
      textAlign: "left !important",
      padding: theme.spacing(0.5),
      "&:before": {
        content: "attr(data-label)",
        fontWeight: "bold",
        display: "inline-block",
        width: "100px",
        marginRight: theme.spacing(1),
      },
    },
  },
}));

const StyledChip = styled(Chip)(({ theme, severity }) => {
  const colors = {
    high: {
      bg: theme.palette.error.main,
      color: theme.palette.error.contrastText,
    },
    medium: {
      bg: theme.palette.warning.main,
      color: theme.palette.warning.contrastText,
    },
    low: {
      bg: theme.palette.success.main,
      color: theme.palette.success.contrastText,
    },
    info: {
      bg: theme.palette.info.main,
      color: theme.palette.info.contrastText,
    },
  };

  return {
    backgroundColor: colors[severity]?.bg || colors.info.bg,
    color: colors[severity]?.color || colors.info.color,
    fontWeight: 600,
    fontSize: "0.8rem",
    height: 24,
    "& .MuiChip-label": {
      padding: theme.spacing(0, 1.5),
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.7rem",
      height: 20,
    },
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(0.8, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
  transition: "all 0.2s ease-in-out",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5, 1.5),
    fontSize: "0.8rem",
  },
}));

const RefreshProgressBar = styled(LinearProgress)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  zIndex: 10,
  "& .MuiLinearProgress-bar": {
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    animationDuration: "2s",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    color: "#ffffff",
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
  [theme.breakpoints.down("sm")]: {
    "& .MuiInputBase-root": {
      fontSize: "0.9rem",
    },
  },
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: "500px",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down("md")]: {
    height: "250px",
  },
  [theme.breakpoints.down("sm")]: {
    height: "200px",
  },
}));

// Reusable TableContainer component
const DataTableContainer = ({
  title,
  data,
  columns,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  IconComponent,
  emptyMessage = "No data available",
  children,
}) => {
  const theme = useTheme();

  return (
    <>
      <Typography
        variant="h6"
        sx={{
          color: "#ffffff",
          mb: 2,
          ml: { xs: 1, sm: 2 },
          fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
        }}
      >
        {title}
      </Typography>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
          border: "1px solid rgba(148, 163, 184, 0.1)",
          width: "100%",
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          overflowX: "auto",
          [theme.breakpoints.down("sm")]: {
            maxWidth: "100%",
          },
        }}
      >
        <Table>
          <StyledTableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledHeaderCell
                  key={column.field}
                  align={column.align || "left"}
                  data-label={column.label}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {IconComponent && <IconComponent sx={{ mr: 1 }} />}
                    {column.label}
                  </Box>
                </StyledHeaderCell>
              ))}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {data.length > 0 ? (
              children
            ) : (
              <StyledTableRow>
                <TableCell colSpan={columns.length} align="center">
                  {emptyMessage}
                </TableCell>
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
        {data.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            sx={{
              color: "#ffffff",
              "& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                {
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                },
            }}
          />
        )}
      </TableContainer>
    </>
  );
};

const HostPage = () => {
  const { hostid } = useParams();
  const location = useLocation();
  const theme = useTheme();
  const [hostName, setHostName] = useState("");
  const [cpu, setCpu] = useState([]);
  const [uptime, setUptime] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTriggers, setActiveTriggers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [triggerForm, setTriggerForm] = useState({
    description: "",
    expression: "",
    priority: 2,
  });
  const [cpuPage, setCpuPage] = useState(0);
  const [uptimePage, setUptimePage] = useState(0);
  const [alertsPage, setAlertsPage] = useState(0);
  const [triggersPage, setTriggersPage] = useState(0);
  const [problemsPage, setProblemsPage] = useState(0);
  const [eventsPage, setEventsPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [history, setHistory] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [recentEvent, setRecentEvent] = useState([]);

  // Refs for scrolling
  const triggersRef = useRef(null);
  const alertsRef = useRef(null);
  const problemsRef = useRef(null);
  const eventsRef = useRef(null);

  const fetchLatestCpuLoad = async (limit = 1) => {
    try {
      const response = await axios.post(
        "http://localhost:9000/api/zabbix/cpu-load-latest",
        { hostid , limit}
      );
      console.log("response.data------------------------->",response.data)
      return response.data;
    } catch (err) {
      console.error("Error fetching latest CPU load:", err);
      setError("Failed to fetch latest CPU load");
      return [];
    }
  };

  const fetchLatestMemoryUtilization = async (limit = 1) => {
    try {
      const response = await axios.post(
        "http://localhost:9000/api/zabbix/memory-utilization-latest",
        { hostid , limit}
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching latest memory utilization:", err);
      setError("Failed to fetch latest memory utilization");
      return [];
    }
  };

  const fetchLatestDiskUtilization = async (limit = 1) => {
    try {
      const response = await axios.post(
        "http://localhost:9000/api/zabbix/disk-utilization-latest",
        { hostid, limit }
      );
      return response.data;
    } catch (err) {
      console.error("Error fetching latest disk utilization:", err);
      setError("Failed to fetch latest disk utilization");
      return [];
    }
  };


  const fetchLatestHostEvent = async () => {
    try {
      // Find the most recent trigger based on lastchange timestamp
      // const mostRecentTrigger = activeTriggers.reduce((latest, trigger) => {
      //   return !latest ||
      //     parseInt(trigger.lastchange) > parseInt(latest.lastchange)
      //     ? trigger
      //     : latest;
      // }, null);

      const response = await axios.post(
        "http://localhost:9000/api/zabbix/most-recent-event-v2"
      );
      // setRecentEvent(response.data);
    } catch (err) {
      console.error("Error fetching recent events:", err);
      setError("Failed to fetch recent events");
      return [];
    }
  };

  // useEffect(() => {
  //   if (activeTriggers[0]?.triggerid) {
  //     fetchRecentEvent();
  //   }
  // }, [activeTriggers[0]?.triggerid]);



  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          hostResponse,
          cpuResponse,
          cpuLoadResponse,
          memoryResponse,
          diskResponse,
          uptimeResponse,
          alertsResponse,
          activeTriggersResponse,
          problemsResponse,
        ] = await Promise.all([
          axios.post("http://localhost:9000/api/zabbix/hosts", {
            hostids: hostid,
            output: ["name"],
          }),
          axios.post("http://localhost:9000/api/zabbix/cpu-load", { hostid }),
          fetchLatestCpuLoad(10),// Fetch 10 CPU records initially
          fetchLatestMemoryUtilization(10),
          fetchLatestDiskUtilization(10),
          axios.post("http://localhost:9000/api/zabbix/uptime", { hostid }),
          axios.post("http://localhost:9000/api/zabbix/alerts", { hostid }),
          axios.post("http://localhost:9000/api/zabbix/active-triggers", {
            hostid,
          }),
          axios.post("http://localhost:9000/api/zabbix/problems", { hostid }),
        ]);
        setHostName(hostResponse.data[0]?.name || "Unknown Host");
        setCpu(cpuResponse.data);
        setUptime(uptimeResponse.data);
        setAlerts(alertsResponse.data);
        setActiveTriggers(activeTriggersResponse.data);
        setProblems(problemsResponse.data);

        // Apply search query filter if present
        const queryParams = new URLSearchParams(location.search);
        const query = queryParams.get("query")?.toLowerCase() || "";
        if (query) {
          const [filterType, filterValue] = query.split(":");
          if (filterType && filterValue) {
            if (filterType === "triggers") {
              setActiveTriggers((triggers) =>
                triggers.filter((t) => t.priority.toString() === filterValue)
              );
            } else if (filterType === "alerts") {
              setAlerts((alerts) =>
                alerts.filter((a) => a.priority.toString() === filterValue)
              );
            } else if (filterType === "problems") {
              setProblems((problems) =>
                problems.filter((p) => p.severity.toString() === filterValue)
              );
            } else {
              setActiveTriggers((triggers) =>
                triggers.filter(
                  (t) =>
                    t.description.toLowerCase().includes(query) ||
                    t.priority.toString().includes(query) ||
                    t.expression.toLowerCase().includes(query)
                )
              );
              setAlerts((alerts) =>
                alerts.filter(
                  (a) =>
                    a.description.toLowerCase().includes(query) ||
                    a.priority.toString().includes(query)
                )
              );
              setProblems((problems) =>
                problems.filter(
                  (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.severity.toString().includes(query)
                )
              );
            }
          }
        }

        // Initialize history with synchronized timestamps for CPU, memory, and disk (10 records each)
        // Find the maximum length among the responses to create a unified history
        const maxLength = Math.max(
          cpuLoadResponse.length,
          memoryResponse.length,
          diskResponse.length
        );
        const initialHistory = Array.from({ length: maxLength }, (_, index) => {
          const cpuItem = cpuLoadResponse[index] || {};
          const memoryItem = memoryResponse[index] || {};
          const diskItem = diskResponse[index] || {};

          // Use the latest available timestamp from any of the metrics
          const timestamp =
            cpuItem.clock || memoryItem.clock || diskItem.clock
              ? new Date(
                  (parseInt(cpuItem.clock || memoryItem.clock || diskItem.clock) +
                    parseInt(cpuItem.ns || memoryItem.ns || diskItem.ns || 0) /
                      1e9) *
                    1000
                ).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })
              : new Date().toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                });

          return {
            timestamp,
            cpu: cpuItem.value ? parseFloat(cpuItem.value) : null,
            memory: memoryItem.value ? parseFloat(memoryItem.value) : null,
            disk: diskItem.value ? parseFloat(diskItem.value) : null,
          };
        });

        setHistory(initialHistory.slice(-60));
        setLoading(false);
      } catch (err) {
        setError("Failed to load host details");
        setLoading(false);
        console.error("Error fetching host data:", err);
      }
    };
    fetchData();
  }, [hostid, location.search]);



  // Poll data every 1 minute
  useEffect(() => {
    const pollData = async () => {
      setRefreshing(true);
      const timestamp = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      const results = await Promise.allSettled([
        fetchLatestCpuLoad(1),
        fetchLatestMemoryUtilization(1),
        fetchLatestDiskUtilization(1),
      ]);

      const cpu =
        results[0].status === "fulfilled" && results[0].value.length > 0
          ? parseFloat(results[0].value[0].value)
          : null;
      const memory =
        results[1].status === "fulfilled" && results[1].value.length > 0
          ? parseFloat(results[1].value[0].value)
          : null;
      const disk =
        results[2].status === "fulfilled" && results[2].value.length > 0
          ? parseFloat(results[2].value[0].value)
          : null;

      if (cpu !== null || memory !== null || disk !== null) {
        const newData = { timestamp, cpu, memory, disk };
        setHistory((prev) => [...prev, newData].slice(-60));
      }

      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          const label = ["CPU", "Memory", "Disk"][idx];
          console.error(`${label} fetch failed:`, result.reason);
        }
      });
      setRefreshing(false);
    };

    // Set up polling every 1 minute
    const intervalId = setInterval(pollData, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [hostid]);

  // Manual fetch handlers
  const handleFetchCpuLoad = async () => {
    setRefreshing(true);
    const data = await fetchLatestCpuLoad(1);
    if (data.length > 0) {
      const timestamp = new Date(
        (parseInt(data[0].clock) + parseInt(data[0].ns) / 1e9) * 1000
      ).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
      setHistory((prev) => {
        const lastEntry =
          prev.length > 0
            ? {
                ...prev[prev.length - 1],
                cpu: parseFloat(data[0].value),
                timestamp,
              }
            : {
                timestamp,
                cpu: parseFloat(data[0].value),
                memory: null,
                disk: null,
              };
        return [...prev.slice(0, -1), lastEntry].slice(-60);
      });
    }
    setRefreshing(false);
  };

  const handleFetchMemoryUtilization = async () => {
    setRefreshing(true);
    const data = await fetchLatestMemoryUtilization(1);
    if (data.length > 0) {
      const timestamp = new Date(
        (parseInt(data[0].clock) + parseInt(data[0].ns) / 1e9) * 1000
      ).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
      setHistory((prev) => {
        const lastEntry =
          prev.length > 0
            ? {
                ...prev[prev.length - 1],
                memory: parseFloat(data[0].value),
                timestamp,
              }
            : {
                timestamp,
                cpu: null,
                memory: parseFloat(data[0].value),
                disk: null,
              };
        return [...prev.slice(0, -1), lastEntry].slice(-60);
      });
    }
    setRefreshing(false);
  };

  const handleFetchDiskUtilization = async () => {
    setRefreshing(true);
    const data = await fetchLatestDiskUtilization(1);
    if (data.length > 0) {
      const timestamp = new Date(
        (parseInt(data[0].clock) + parseInt(data[0].ns) / 1e9) * 1000
      ).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });
      setHistory((prev) => {
        const lastEntry =
          prev.length > 0
            ? {
                ...prev[prev.length - 1],
                disk: parseFloat(data[0].value),
                timestamp,
              }
            : {
                timestamp,
                cpu: null,
                memory: null,
                disk: parseFloat(data[0].value),
              };
        return [...prev.slice(0, -1), lastEntry].slice(-60);
      });
    }
    setRefreshing(false);
  };

  // Scroll handlers
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Modal handlers
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setTriggerForm({ description: "", expression: "", priority: 2 });
  };

  // Filter history to remove entries with all null values
  const filteredHistory = history.filter(
    (data) => data.cpu !== null || data.memory !== null || data.disk !== null
  );

  console.log("filteredHistory----------------->",filteredHistory)

  // Chart configurations
  const cpuChartData = {
    labels: filteredHistory.map((data) => data.timestamp),
    datasets: [
      {
        label: "CPU Load (per core, avg1)",
        data: filteredHistory.map((data) => data.cpu ?? null),
        fill: false,
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.5)",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        hidden: filteredHistory.every((data) => data.cpu === null),
      },
    ],
  };

  const memoryChartData = {
    labels: filteredHistory.map((data) => data.timestamp),
    datasets: [
      {
        label: "Memory Utilization (% available)",
        data: filteredHistory.map((data) => data.memory ?? null),
        fill: false,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.5)",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        hidden: filteredHistory.every((data) => data.memory === null),
      },
    ],
  };

  const diskChartData = {
    labels: filteredHistory.map((data) => data.timestamp),
    datasets: [
      {
        label: "Disk Utilization (% used)",
        data: filteredHistory.map((data) => data.disk ?? null),
        fill: false,
        borderColor: "#f44336",
        backgroundColor: "rgba(244, 67, 54, 0.5)",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        hidden: filteredHistory.every((data) => data.disk === null),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#ffffff",
          font: {
            size: window.innerWidth < 600 ? 12 : 14,
          },
          padding: 20,
          boxWidth: window.innerWidth < 600 ? 30 : 40,
        },
      },
      title: {
        display: true,
        color: "#ffffff",
        font: {
          size: window.innerWidth < 600 ? 14 : 18,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: window.innerWidth < 600 ? 12 : 14 },
        bodyFont: { size: window.innerWidth < 600 ? 10 : 12 },
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        min: 0,
        title: {
          display: true,
          text: "Percentage (%)",
          color: "#ffffff",
          font: { size: window.innerWidth < 600 ? 12 : 14 },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
        ticks: {
          color: "#ffffff",
          stepSize: 20,
          callback: (value) => `${value}%`,
        },
      },
      x: {
        title: {
          display: true,
          text: "Time (IST)",
          color: "#ffffff",
          font: { size: window.innerWidth < 600 ? 12 : 14 },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
        ticks: {
          color: "#ffffff",
          maxRotation: window.innerWidth < 600 ? 45 : 0,
          minRotation: window.innerWidth < 600 ? 45 : 0,
          maxTicksLimit: window.innerWidth < 600 ? 5 : 10,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
  };

  const handleTriggerSubmit = async () => {
    try {
      await axios.post("http://localhost:9000/api/zabbix/trigger/create", {
        hostid,
        description: triggerForm.description,
        expression: triggerForm.expression,
        priority: parseInt(triggerForm.priority),
      });
      setTriggerForm({ description: "", expression: "", priority: 2 });
      const response = await axios.post(
        "http://localhost:9000/api/zabbix/active-triggers",
        { hostid }
      );
      setActiveTriggers(response.data);
      handleCloseModal();
    } catch (err) {
      setError("Failed to create trigger");
      console.error("Error creating trigger:", err);
    }
  };

  const handleTriggerStatusUpdate = async (triggerid, status) => {
    try {
      await axios.post("http://localhost:9000/api/zabbix/trigger/update", {
        triggerid,
        status,
      });
      const response = await axios.post(
        "http://localhost:9000/api/zabbix/active-triggers",
        { hostid }
      );
      setActiveTriggers(response.data);
    } catch (err) {
      setError("Failed to update trigger status");
      console.error("Error updating trigger:", err);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCpuPage(0);
    setUptimePage(0);
    setAlertsPage(0);
    setTriggersPage(0);
    setProblemsPage(0);
    setEventsPage(0);
  };

  const priorityColors = {
    0: "info",
    1: "info",
    2: "warning",
    3: "error",
    4: "error",
    5: "error",
  };

  return (
    <StyledContainer>
      <Fade in={true} timeout={800}>
        <div>
          <HeaderCard
            sx={{
              background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              borderBottom: `2px solid ${theme.palette.secondary.main}`,
            }}
          >
            {refreshing && <RefreshProgressBar />}
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 2,
                px: { xs: 2, sm: 3, md: 4 },
                position: "relative",
                flexWrap: "wrap",
                gap: 2,
                "&:after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.main} 100%)`,
                  opacity: 0.7,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flex: { xs: "1 1 100%", sm: "0 1 auto" },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    boxShadow: theme.shadows[4],
                  }}
                >
                  <ComputerIcon fontSize="medium" />
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                      background: `linear-gradient(90deg, #fff 0%, ${theme.palette.secondary.light} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.75rem" },
                    }}
                  >
                    {hostName} (ID: {hostid})
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "rgba(255,255,255,0.85)",
                      fontStyle: "italic",
                      letterSpacing: "0.3px",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    Host Details
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: { xs: "center", sm: "flex-end" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
               <ActionButton onClick={handleFetchCpuLoad}>
                  Fetch CPU Load
                </ActionButton>
                <ActionButton onClick={handleFetchMemoryUtilization}>
                  Fetch Memory
                </ActionButton>
                <ActionButton onClick={handleFetchDiskUtilization}>
                  Fetch Disk
                </ActionButton> 
              
                {/* <ActionButton onClick={fetchLatestHostEvent}>
                  Test Event
                </ActionButton> */}
                {/* <ActionButton onClick={handleOpenModal}>Create Trigger</ActionButton> */}
              </Box>
            </CardContent>
          </HeaderCard>

          <Dialog
            open={openModal}
            onClose={handleCloseModal}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
                color: "#ffffff",
              },
            }}
          >
            <DialogTitle sx={{ color: "#ffffff", fontWeight: 600 }}>
              Create New Trigger
            </DialogTitle>
            <DialogContent>
              <StyledTextField
                label="Description"
                value={triggerForm.description}
                onChange={(e) =>
                  setTriggerForm({
                    ...triggerForm,
                    description: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
              <StyledTextField
                label="Expression (e.g., last(/{host}/system.cpu.load[percpu,avg1])>5)"
                value={triggerForm.expression}
                onChange={(e) =>
                  setTriggerForm({ ...triggerForm, expression: e.target.value })
                }
                fullWidth
                margin="normal"
              />
              <StyledTextField
                label="Priority (0-5)"
                type="number"
                value={triggerForm.priority}
                onChange={(e) =>
                  setTriggerForm({ ...triggerForm, priority: e.target.value })
                }
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 5 }}
              />
            </DialogContent>
            <DialogActions>
              <ActionButton onClick={handleCloseModal} color="secondary">
                Cancel
              </ActionButton>
              <ActionButton
                onClick={handleTriggerSubmit}
                disabled={!triggerForm.description || !triggerForm.expression}
              >
                Create Trigger
              </ActionButton>
            </DialogActions>
          </Dialog>

          {error && (
            <Box
              sx={{
                mb: 3,
                borderRadius: theme.shape.borderRadius,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: theme.palette.error.main,
                border: `1px solid ${theme.palette.error.main}`,
                p: { xs: 1, sm: 2 },
                maxWidth: "1200px",
                mx: "auto",
              }}
            >
              <Typography
                variant="body1"
                fontSize={{ xs: "0.9rem", sm: "1rem" }}
              >
                {error}
              </Typography>
            </Box>
          )}

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress
                size={60}
                sx={{ color: theme.palette.primary.contrastText }}
              />
            </Box>
          ) : (
            <>
              <StatsGridContainer>
                <StatsCard onClick={() => scrollToSection(triggersRef)}>
                  <CardContent
                    sx={{
                      textAlign: "center",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.info.main,
                        mb: 2,
                        width: { xs: 48, sm: 56 },
                        height: { xs: 48, sm: 56 },
                      }}
                    >
                      <TimelineIcon fontSize="large" />
                    </Avatar>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="info.main"
                      fontSize={{ xs: "1.5rem", sm: "2rem" }}
                    >
                      {activeTriggers.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                    >
                      Active Triggers
                    </Typography>
                  </CardContent>
                </StatsCard>
                <StatsCard onClick={() => scrollToSection(alertsRef)}>
                  <CardContent
                    sx={{
                      textAlign: "center",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.warning.main,
                        mb: 2,
                        width: { xs: 48, sm: 56 },
                        height: { xs: 48, sm: 56 },
                      }}
                    >
                      <NotificationsIcon fontSize="large" />
                    </Avatar>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="warning.main"
                      fontSize={{ xs: "1.5rem", sm: "2rem" }}
                    >
                      {alerts.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                    >
                      Alerts
                    </Typography>
                  </CardContent>
                </StatsCard>
                <StatsCard onClick={() => scrollToSection(problemsRef)}>
                  <CardContent
                    sx={{
                      textAlign: "center",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.error.main,
                        mb: 2,
                        width: { xs: 48, sm: 56 },
                        height: { xs: 48, sm: 56 },
                      }}
                    >
                      <BugReportIcon fontSize="large" />
                    </Avatar>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color="error.main"
                      fontSize={{ xs: "1.5rem", sm: "2rem" }}
                    >
                      {problems.length}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                    >
                      Problems
                    </Typography>
                  </CardContent>
                </StatsCard>
              </StatsGridContainer>

              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  ml: { xs: 1, sm: 2 },
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                }}
              >
                CPU Load Over Time
              </Typography>
              <ChartContainer>
                <Card
                  sx={{
                    background:
                      "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ height: "100%" }}>
                    {filteredHistory.length > 0 ? (
                      <Line
                        data={cpuChartData}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: "CPU Load Over Time",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        align="center"
                        color="textSecondary"
                        fontSize={{ xs: "0.9rem", sm: "1rem" }}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        No CPU data available. Please wait or fetch manually.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </ChartContainer>

              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  ml: { xs: 1, sm: 2 },
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                }}
              >
                Memory Utilization Over Time
              </Typography>
              <ChartContainer>
                <Card
                  sx={{
                    background:
                      "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ height: "100%" }}>
                    {filteredHistory.length > 0 ? (
                      <Line
                        data={memoryChartData}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: "Memory Utilization Over Time",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        align="center"
                        color="textSecondary"
                        fontSize={{ xs: "0.9rem", sm: "1rem" }}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        No memory data available. Please wait or fetch manually.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </ChartContainer>

              <Typography
                variant="h6"
                sx={{
                  color: "#ffffff",
                  mb: 2,
                  ml: { xs: 1, sm: 2 },
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                }}
              >
                Disk Utilization Over Time
              </Typography>
              <ChartContainer>
                <Card
                  sx={{
                    background:
                      "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ height: "100%" }}>
                    {filteredHistory.length > 0 ? (
                      <Line
                        data={diskChartData}
                        options={{
                          ...chartOptions,
                          plugins: {
                            ...chartOptions.plugins,
                            title: {
                              ...chartOptions.plugins.title,
                              text: "Disk Utilization Over Time",
                            },
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        align="center"
                        color="textSecondary"
                        fontSize={{ xs: "0.9rem", sm: "1rem" }}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        No disk data available. Please wait or fetch manually.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </ChartContainer>

              {/* CPU Load Table */}
              <DataTableContainer
                title="CPU Load"
                data={cpu}
                columns={[
                  { field: "name", label: "Name" },
                  { field: "lastvalue", label: "Last Value", align: "center" },
                ]}
                page={cpuPage}
                rowsPerPage={rowsPerPage}
                onPageChange={(event, newPage) => setCpuPage(newPage)}
                onRowsPerPageChange={handleChangeRowsPerPage}
                IconComponent={ComputerIcon}
                emptyMessage="No CPU data available"
              >
                {cpu
                  .slice(
                    cpuPage * rowsPerPage,
                    cpuPage * rowsPerPage + rowsPerPage
                  )
                  .map((item) => (
                    <StyledTableRow key={item.itemid}>
                      <TableCell data-label="Name">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              mr: 2,
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 },
                            }}
                          >
                            <ComputerIcon />
                          </Avatar>
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            fontSize={{ xs: "0.9rem", sm: "1rem" }}
                          >
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center" data-label="Last Value">
                        <Typography
                          variant="body2"
                          fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                        >
                          {item.lastvalue}
                        </Typography>
                      </TableCell>
                    </StyledTableRow>
                  ))}
              </DataTableContainer>

              {/* Uptime Table */}
              <DataTableContainer
                title="Uptime"
                data={uptime}
                columns={[
                  { field: "name", label: "Name" },
                  { field: "lastvalue", label: "Uptime", align: "center" },
                ]}
                page={uptimePage}
                rowsPerPage={rowsPerPage}
                onPageChange={(event, newPage) => setUptimePage(newPage)}
                onRowsPerPageChange={handleChangeRowsPerPage}
                IconComponent={StorageIcon}
                emptyMessage="No uptime data available"
              >
                {uptime
                  .slice(
                    uptimePage * rowsPerPage,
                    uptimePage * rowsPerPage + rowsPerPage
                  )
                  .map((item) => (
                    <StyledTableRow key={item.itemid}>
                      <TableCell data-label="Name">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              mr: 2,
                              width: { xs: 32, sm: 40 },
                              height: { xs: 32, sm: 40 },
                            }}
                          >
                            <StorageIcon />
                          </Avatar>
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            fontSize={{ xs: "0.9rem", sm: "1rem" }}
                          >
                            {item.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center" data-label="Uptime">
                        <Typography
                          variant="body2"
                          fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                        >
                          {formatUptime(item.lastvalue)}
                        </Typography>
                      </TableCell>
                    </StyledTableRow>
                  ))}
              </DataTableContainer>

              {/* Alerts Table */}
              <Box ref={alertsRef}>
                <DataTableContainer
                  title="Alerts"
                  data={alerts}
                  columns={[
                    { field: "description", label: "Description" },
                    { field: "priority", label: "Priority", align: "center" },
                    {
                      field: "lastchange",
                      label: "Last Change",
                      align: "center",
                    },
                  ]}
                  page={alertsPage}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(event, newPage) => setAlertsPage(newPage)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  IconComponent={NotificationsIcon}
                  emptyMessage="No alerts available"
                >
                  {alerts
                    .slice(
                      alertsPage * rowsPerPage,
                      alertsPage * rowsPerPage + rowsPerPage
                    )
                    .map((alert, index) => (
                      <StyledTableRow key={index}>
                        <TableCell data-label="Description">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.warning.main,
                                mr: 2,
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                              }}
                            >
                              <NotificationsIcon />
                            </Avatar>
                            <Typography
                              variant="body1"
                              fontWeight="600"
                              fontSize={{ xs: "0.9rem", sm: "1rem" }}
                            >
                              {alert.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" data-label="Priority">
                          <StyledChip
                            label={alert.priority}
                            severity={priorityColors[alert.priority] || "info"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center" data-label="Last Change">
                          <Typography
                            variant="body2"
                            fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                          >
                            {new Date(alert.lastchange * 1000).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                </DataTableContainer>
              </Box>

              {/* Triggers Table */}
              <Box ref={triggersRef}>
                <DataTableContainer
                  title="Active Triggers with Dependencies"
                  data={activeTriggers}
                  columns={[
                    { field: "description", label: "Description" },
                    { field: "priority", label: "Priority", align: "center" },
                    {
                      field: "expression",
                      label: "Expression",
                      align: "center",
                    },
                    {
                      field: "lastchange",
                      label: "Last Change",
                      align: "center",
                    },
                    { field: "status", label: "Status", align: "center" },
                  ]}
                  page={triggersPage}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(event, newPage) => setTriggersPage(newPage)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  IconComponent={TimelineIcon}
                  emptyMessage="No active triggers available"
                >
                  {activeTriggers
                    .slice(
                      triggersPage * rowsPerPage,
                      triggersPage * rowsPerPage + rowsPerPage
                    )
                    .map((trigger) => (
                      <StyledTableRow key={trigger.triggerid}>
                        <TableCell data-label="Description">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.info.main,
                                mr: 2,
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                              }}
                            >
                              <TimelineIcon />
                            </Avatar>
                            <Typography
                              variant="body1"
                              fontWeight="600"
                              fontSize={{ xs: "0.9rem", sm: "1rem" }}
                            >
                              {trigger.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" data-label="Priority">
                          <StyledChip
                            label={trigger.priority}
                            severity={
                              priorityColors[trigger.priority] || "info"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center" data-label="Expression">
                          <Typography
                            variant="body2"
                            fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                          >
                            {trigger.expression}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" data-label="Last Change">
                          <Typography
                            variant="body2"
                            fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                          >
                            {new Date(
                              trigger.lastchange * 1000
                            ).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" data-label="Status">
                          <ActionButton
                            variant="contained"
                            size="small"
                            color={trigger.status === "0" ? "error" : "success"}
                            onClick={() =>
                              handleTriggerStatusUpdate(
                                trigger.triggerid,
                                trigger.status === "0" ? 1 : 0
                              )
                            }
                          >
                            {trigger.status === "0" ? "Disable" : "Enable"}
                          </ActionButton>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                </DataTableContainer>
              </Box>

              {/* Problems Table */}
              <Box ref={problemsRef}>
                <DataTableContainer
                  title="Problems"
                  data={problems}
                  columns={[
                    { field: "eventid", label: "Event ID" },
                    { field: "name", label: "Name", align: "center" },
                    { field: "severity", label: "Severity", align: "center" },
                    { field: "clock", label: "Time", align: "center" },
                    {
                      field: "acknowledges",
                      label: "Acknowledged",
                      align: "center",
                    },
                  ]}
                  page={problemsPage}
                  rowsPerPage={rowsPerPage}
                  onPageChange={(event, newPage) => setProblemsPage(newPage)}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  IconComponent={BugReportIcon}
                  emptyMessage="No problems available"
                >
                  {problems
                    .slice(
                      problemsPage * rowsPerPage,
                      problemsPage * rowsPerPage + rowsPerPage
                    )
                    .map((problem) => (
                      <StyledTableRow key={problem.eventid}>
                        <TableCell data-label="Event ID">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.error.main,
                                mr: 2,
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                              }}
                            >
                              <BugReportIcon />
                            </Avatar>
                            <Typography
                              variant="body1"
                              fontWeight="600"
                              fontSize={{ xs: "0.9rem", sm: "1rem" }}
                            >
                              {problem.eventid}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" data-label="Name">
                          <Typography
                            variant="body2"
                            fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                          >
                            {problem.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" data-label="Severity">
                          <StyledChip
                            label={problem.severity}
                            severity={
                              priorityColors[problem.severity] || "info"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center" data-label="Time">
                          <Typography
                            variant="body2"
                            fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                          >
                            {new Date(
                              parseInt(problem.clock) * 1000
                            ).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" data-label="Acknowledged">
                          <Typography
                            variant="body2"
                            fontSize={{ xs: "0.8rem", sm: "0.9rem" }}
                          >
                            {problem.acknowledges.length > 0 ? "Yes" : "No"}
                          </Typography>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                </DataTableContainer>
              </Box>
            </>
          )}
        </div>
      </Fade>
    </StyledContainer>
  );
};

export default HostPage;
