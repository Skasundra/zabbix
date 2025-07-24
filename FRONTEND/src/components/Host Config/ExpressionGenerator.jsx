import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fade,
  Collapse,
  styled,
} from "@mui/material";
import {
  Build as BuildIcon,
  Code as CodeIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
  ListAlt as ListIcon,
  Monitor as MonitorIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

// Styled components for enhanced design
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  overflow: "hidden",
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.default,
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #3b82f6 30%, #60a5fa 90%)",
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  textTransform: "none",
  fontWeight: 600,
  "&:hover": {
    background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
  },
}));

const CustomExpressionCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #1e293b 0%, #2d3748 100%)",
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: "relative",
  overflow: "visible",
  "&::before": {
    content: '""',
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: theme.shape.borderRadius * 1.5,
    background: "linear-gradient(45deg, #60a5fa, #34d399)",
    zIndex: -1,
  },
}));

const CustomTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    fontFamily: "monospace",
    fontSize: "0.875rem",
    background: theme.palette.grey[900],
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      background: theme.palette.grey[800],
    },
  },
  "& .MuiInputLabel-root": {
    color: theme.palette.grey[400],
    fontWeight: 500,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.grey[700],
  },
}));

const metricOptions = {
  Basic: [
    {
      label: "System Uptime",
      key: "system.uptime",
      description: "Tracks how long the system has been running",
      icon: <ScheduleIcon />,
    },
    {
      label: "CPU Idle",
      key: "system.cpu.util[0,idle]",
      description: "Monitors CPU idle percentage",
      icon: <SpeedIcon />,
    },
    {
      label: "Memory Usage",
      key: "vm.memory.size[used]",
      description: "Tracks memory consumption",
      icon: <MemoryIcon />,
    },
    {
      label: "CPU Load Average",
      key: "system.cpu.load[percpu,avg1]",
      description: "1-minute CPU load average",
      icon: <SpeedIcon />,
    },
    {
      label: "Disk Space Free",
      key: "vfs.fs.size[/,pfree]",
      description: "Free disk space percentage",
      icon: <StorageIcon />,
    },
  ],
  Advanced: [
    {
      label: "Disk I/O Read",
      key: "vfs.dev.read[sda,operations]",
      description: "Disk read operations per second",
      icon: <StorageIcon />,
    },
    {
      label: "HTTP Response Code",
      key: "web.page.regexp[,,,200]",
      description: "HTTP response code check",
      icon: <NetworkIcon />,
    },
    {
      label: "Website Response Time",
      key: "web.page.perf[]",
      description: "Website response time in seconds",
      icon: <TimelineIcon />,
    },
    {
      label: "Running Processes",
      key: "proc.num[]",
      description: "Number of running processes",
      icon: <SettingsIcon />,
    },
    {
      label: "Network Interface Status",
      key: "net.if.in[eth0]",
      description: "Network interface incoming traffic",
      icon: <NetworkIcon />,
    },
  ],
  Monitoring: [
    {
      label: "ICMP Ping",
      key: "icmpping",
      description: "Host availability check via ping",
      icon: <NetworkIcon />,
    },
    {
      label: "Logged Users",
      key: "system.users.num",
      description: "Number of logged-in users",
      icon: <SecurityIcon />,
    },
    {
      label: "NTP Time Offset",
      key: "system.localtime[utc]",
      description: "System time drift from NTP",
      icon: <ScheduleIcon />,
    },
    {
      label: "TCP Service Check",
      key: "net.tcp.service[ssh]",
      description: "TCP service availability",
      icon: <NetworkIcon />,
    },
    {
      label: "Log File Monitoring",
      key: "log[/var/log/messages,error]",
      description: "Monitor log files for specific patterns",
      icon: <ListIcon />,
    },
  ],
};

const commonExpressions = [
  {
    name: "CPU Load is High (>90%)",
    expression: "last(/HOST/system.cpu.util[0,user]) > 90",
    explanation:
      "Triggers when CPU utilization exceeds 90%. High CPU usage can indicate system overload or runaway processes.",
    severity: "high",
    category: "Performance",
  },
  {
    name: "Disk Space Less Than 10% Free",
    expression: "last(/HOST/vfs.fs.size[/,pfree]) < 10",
    explanation:
      "Alerts when free disk space drops below 10%. Critical for preventing system crashes due to full disk.",
    severity: "critical",
    category: "Storage",
  },
  {
    name: "Memory Usage Above 85%",
    expression: "last(/HOST/vm.memory.size[pavailable]) < 15",
    explanation:
      "Triggers when available memory is less than 15% (85% used). High memory usage can lead to system slowdown.",
    severity: "high",
    category: "Performance",
  },
  {
    name: "Host is Down (No ICMP Ping)",
    expression: "max(/HOST/icmpping,120s) = 0",
    explanation:
      "Detects if host doesn't respond to ping for 2 minutes. Essential for monitoring host availability.",
    severity: "critical",
    category: "Availability",
  },
  {
    name: "Website Response Time > 3s",
    expression: "last(/HOST/web.page.perf[]) > 3",
    explanation:
      "Alerts when website response time exceeds 3 seconds. Slow response times affect user experience.",
    severity: "medium",
    category: "Performance",
  },
  {
    name: "Running Processes < 1",
    expression: "last(/HOST/proc.num[]) < 1",
    explanation:
      "Triggers when critical processes are not running. Indicates service failure or system issues.",
    severity: "high",
    category: "System",
  },
  {
    name: "System Time Drift > 5s",
    expression: "abs(last(/HOST/system.localtime[utc]) - time()) > 5",
    explanation:
      "Detects time drift over 5 seconds from NTP. Time synchronization is crucial for logs and authentication.",
    severity: "medium",
    category: "System",
  },
  {
    name: "Too Many Logged Users (>20)",
    expression: "last(/HOST/system.users.num) > 20",
    explanation:
      "Alerts when more than 20 users are logged in. May indicate security issues or unusual activity.",
    severity: "medium",
    category: "Security",
  },
  {
    name: "Network Interface Down",
    expression:
      "last(/HOST/net.if.in[eth0]) = 0 and last(/HOST/net.if.out[eth0]) = 0",
    explanation:
      "Detects network interface failure when no traffic flows in either direction.",
    severity: "high",
    category: "Network",
  },
];

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ExpressionGenerator = () => {
  const [host, setHost] = useState("Zabbix server");
  const [type, setType] = useState("Basic");
  const [metric, setMetric] = useState("");
  const [operator, setOperator] = useState("<");
  const [threshold, setThreshold] = useState("");
  const [expression, setExpression] = useState("");
  const [explanation, setExplanation] = useState("");
  const [customExpression, setCustomExpression] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCommon, setSelectedCommon] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleGenerate = () => {
    if (host && metric && operator && threshold) {
      const finalExpr = `last(/${host}/${metric}) ${operator} ${threshold}`;
      setExpression(finalExpr);

      const selectedMetric = metricOptions[type].find((m) => m.key === metric);
      const operatorText = {
        "<": "less than",
        ">": "greater than",
        "==": "equals",
        "!=": "not equals",
        "<=": "less than or equal to",
        ">=": "greater than or equal to",
      };

      const explain = `This expression monitors ${
        selectedMetric?.label || "the selected metric"
      } on host "${host}". It triggers when the current value is ${
        operatorText[operator]
      } ${threshold}. ${selectedMetric?.description || ""}`;
      setExplanation(explain);
      setShowResult(true);
    }
  };

  const handleCommonSelect = (expr) => {
    const updatedExpr = expr.expression.replace("/HOST/", `/${host}/`);
    setExpression(updatedExpr);
    setExplanation(expr.explanation.replace("HOST", host));
    setSelectedCommon(expr.name);
    setShowResult(true);
  };

  const handleCustomGenerate = () => {
    if (customExpression.trim()) {
      const updatedExpr = customExpression.replace(/\/HOST\//g, `/${host}/`);
      setExpression(updatedExpr);
      setExplanation(
        "Custom expression: This is a user-defined expression. Please verify the syntax and logic according to your monitoring requirements."
      );
      setShowResult(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(expression);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: "background.default" }}>
      <StyledPaper elevation={0}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
            color: "white",
            p: 4,
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <MonitorIcon sx={{ fontSize: 48, color: "#60a5fa" }} />
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ letterSpacing: 1 }}
              >
                Zabbix Expression Generator
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.8, mt: 0.5 }}>
                Craft precise monitoring expressions effortlessly
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Host Configuration */}
        <Box sx={{ p: 3, bgcolor: "background.paper" }}>
          <TextField
            label="Host Name"
            fullWidth
            value={host}
            onChange={(e) => setHost(e.target.value)}
            variant="outlined"
            size="medium"
            InputProps={{
              startAdornment: (
                <MonitorIcon sx={{ color: "primary.main", mr: 1 }} />
              ),
              sx: { bgcolor: "background.default", borderRadius: 2 },
            }}
            sx={{ maxWidth: 500 }}
          />
        </Box>

        {/* Navigation Tabs */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "1rem",
              },
              "& .Mui-selected": {
                color: "primary.main",
              },
            }}
            TabIndicatorProps={{
              style: { backgroundColor: "#60a5fa" },
            }}
          >
            <Tab
              icon={<BuildIcon />}
              label="Expression Builder"
              iconPosition="start"
            />
            <Tab
              icon={<ListIcon />}
              label="Common Expressions"
              iconPosition="start"
            />
            <Tab
              icon={<CodeIcon />}
              label="Custom Expression"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 4, bgcolor: "background.paper" }}>
          {/* Expression Builder Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 500 }}>Metric Type</InputLabel>
                  <Select
                    value={type}
                    label="Metric Type"
                    onChange={(e) => {
                      setType(e.target.value);
                      setMetric("");
                    }}
                    sx={{ bgcolor: "background.default", borderRadius: 2 }}
                  >
                    {Object.keys(metricOptions).map((t) => (
                      <MenuItem key={t} value={t}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {t === "Basic" && <SpeedIcon />}
                          {t === "Advanced" && <SettingsIcon />}
                          {t === "Monitoring" && <MonitorIcon />}
                          {t}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{width: 200}}>
                  <InputLabel sx={{ fontWeight: 500 }}>Metric</InputLabel>
                  <Select
                    value={metric}
                    label="Metric"
                    onChange={(e) => setMetric(e.target.value)}
                    sx={{ bgcolor: "background.default", borderRadius: 2 }}
                  >
                    {metricOptions[type].map((option) => (
                      <MenuItem key={option.key} value={option.key}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {option.icon}
                          <Box>
                            <Typography variant="body2">
                              {option.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {option.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 500 }}>Operator</InputLabel>
                  <Select
                    value={operator}
                    label="Operator"
                    onChange={(e) => setOperator(e.target.value)}
                    sx={{ bgcolor: "background.default", borderRadius: 2 }}
                  >
                    <MenuItem value="<">Less than (&lt;)</MenuItem>
                    <MenuItem value=">">Greater than (&gt;)</MenuItem>
                    <MenuItem value="==">Equals (==)</MenuItem>
                    <MenuItem value="!=">Not equals (!=)</MenuItem>
                    <MenuItem value="<=">Less than or equal (≤)</MenuItem>
                    <MenuItem value=">=">Greater than or equal (≥)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Threshold Value"
                  fullWidth
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  variant="outlined"
                  sx={{ bgcolor: "background.default", borderRadius: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <GradientButton
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleGenerate}
                  disabled={!host || !metric || !threshold}
                  startIcon={<PlayIcon />}
                >
                  Generate Expression
                </GradientButton>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Common Expressions Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={2}>
              {commonExpressions.map((expr, index) => (
                <Grid item xs={12} key={index}>
                  <StyledCard
                    onClick={() => handleCommonSelect(expr)}
                    sx={{
                      border: selectedCommon === expr.name ? 2 : 1,
                      borderColor:
                        selectedCommon === expr.name
                          ? "primary.main"
                          : "divider",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                        }}
                      >
                        <WarningIcon color="warning" />
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <Typography variant="h6" component="h3">
                              {expr.name}
                            </Typography>
                            <Chip
                              label={expr.severity}
                              size="small"
                              color={getSeverityColor(expr.severity)}
                            />
                            <Chip
                              label={expr.category}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {expr.explanation}
                          </Typography>
                          <Paper
                            sx={{
                              p: 1.5,
                              bgcolor: "grey.900",
                              fontFamily: "monospace",
                              fontSize: "0.875rem",
                              color: "white",
                              borderRadius: 1,
                            }}
                          >
                            {expr.expression.replace("/HOST/", `/${host}/`)}
                          </Paper>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Custom Expression Tab */}
          <TabPanel value={activeTab} index={2}>
            <CustomExpressionCard>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                  <CodeIcon sx={{ fontSize: 32, color: "#34d399" }} />
                  <Typography variant="h5" fontWeight="bold">
                    Custom Expression Editor
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <CustomTextField
                      label="Custom Expression"
                      fullWidth
                      multiline
                      rows={8}
                      value={customExpression}
                      onChange={(e) => setCustomExpression(e.target.value)}
                      variant="outlined"
                      placeholder="Enter your custom Zabbix expression here (e.g., last(/HOST/system.cpu.util[0,user]) > 90)..."
                      InputProps={{
                        startAdornment: (
                          <EditIcon sx={{ color: "grey.500", mr: 1 }} />
                        ),
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, display: "block", color: "grey.400" }}
                    >
                      Use <code>/HOST/</code> as a placeholder for the host name. Ensure correct Zabbix syntax for reliable monitoring.
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mt: 2, mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: "grey.300" }}>
                        Quick Tips
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon sx={{ color: "#60a5fa" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Use 'last()' for latest value checks"
                            secondary="Example: last(/HOST/system.cpu.util[0,user]) > 90"
                            secondaryTypographyProps={{ color: "grey.500" }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon sx={{ color: "#60a5fa" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Include time periods for trends"
                            secondary="Example: avg(/HOST/system.cpu.load[percpu,avg1],5m) > 5"
                            secondaryTypographyProps={{ color: "grey.500" }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon sx={{ color: "#60a5fa" }} />
                          </ListItemIcon>
                          <ListItemText
                            primary="Combine conditions with 'and'/'or'"
                            secondary="Example: last(/HOST/net.if.in[eth0]) = 0 and last(/HOST/net.if.out[eth0]) = 0"
                            secondaryTypographyProps={{ color: "grey.500" }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <GradientButton
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleCustomGenerate}
                      disabled={!customExpression.trim()}
                      startIcon={<CodeIcon />}
                      sx={{
                        background:
                          "linear-gradient(45deg, #10b981 30%, #34d399 90%)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #059669 30%, #10b981 90%)",
                        },
                        py: 1.5,
                      }}
                    >
                      Generate Custom Expression
                    </GradientButton>
                  </Grid>
                </Grid>
              </CardContent>
            </CustomExpressionCard>
          </TabPanel>

          {/* Generated Expression Display */}
          <Collapse in={showResult}>
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ mb: 3, bgcolor: "grey.800" }} />

              <Fade in={showResult}>
                <Box>
                  <Alert
                    severity="success"
                    sx={{
                      mb: 3,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    action={
                      <Tooltip title="Copy Expression">
                        <IconButton
                          color="inherit"
                          size="small"
                          onClick={handleCopy}
                        >
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                      Generated Expression
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "grey.900",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        wordBreak: "break-all",
                        color: "white",
                        borderRadius: 1,
                      }}
                    >
                      {expression}
                    </Paper>
                  </Alert>

                  {explanation && (
                    <Alert
                      severity="info"
                      icon={<InfoIcon />}
                      sx={{
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                        Expression Explanation
                      </Typography>
                      <Typography variant="body2">{explanation}</Typography>
                    </Alert>
                  )}
                </Box>
              </Fade>
            </Box>
          </Collapse>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default ExpressionGenerator;