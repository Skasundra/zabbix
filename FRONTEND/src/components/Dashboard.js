import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
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
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Container,
  Avatar,
  Button,
  Fade,
  Skeleton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  AlertTitle,
} from '@mui/material';
import {
  Computer as ComputerIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  BugReport as BugReportIcon,
  Storage as StorageIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  NetworkCheck as NetworkCheckIcon,
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';

// Enhanced styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: '100vh',
  backgroundColor: '#0f172a',
  color: theme.palette.text.primary,
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  overflow: 'hidden',
  width: '100%',
  position: 'relative',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '180px',
  minWidth: '240px',
  flex: 1,
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },
}));

const StatsGridContainer = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
  '& > *': {
    flex: '1 1 240px',
    minWidth: '240px',
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  marginTop: theme.spacing(3),
  border: '1px solid rgba(148, 163, 184, 0.1)',
  width: '100%',
  overflowX: 'auto',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.contrastText,
  fontSize: '0.9rem',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  padding: theme.spacing(1.5),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  '&:nth-of-type(odd)': {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  '&:hover': {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    transform: 'scale(1.01)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  transition: 'all 0.2s ease-in-out',
}));

const StyledChip = styled(Chip)(({ theme, severity }) => {
  const colors = {
    high: { bg: theme.palette.error.main, color: theme.palette.error.contrastText },
    medium: { bg: theme.palette.warning.main, color: theme.palette.warning.contrastText },
    low: { bg: theme.palette.success.main, color: theme.palette.success.contrastText },
    info: { bg: theme.palette.info.main, color: theme.palette.info.contrastText },
  };

  return {
    backgroundColor: colors[severity]?.bg || colors.info.bg,
    color: colors[severity]?.color || colors.info.color,
    fontWeight: 600,
    fontSize: '0.8rem',
    height: 24,
    '& .MuiChip-label': {
      padding: theme.spacing(0, 1.5),
    },
  };
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(0.8, 2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  transition: 'all 0.2s ease-in-out',
}));

const AddHostButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 2.5),
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
  },
  transition: 'all 0.2s ease-in-out',
}));

const RefreshProgressBar = styled(LinearProgress)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: 4,
  zIndex: 10,
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    animationDuration: '2s',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: theme.palette.text.primary,
    border: '1px solid rgba(148, 163, 184, 0.1)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    minWidth: '500px',
    maxWidth: '600px',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  fontWeight: 700,
  fontSize: '1.5rem',
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: theme.shape.borderRadius,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: theme.shape.borderRadius,
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const Dashboard = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openAddHostModal, setOpenAddHostModal] = useState(false);
  const [addingHost, setAddingHost] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state for adding host
  const [hostForm, setHostForm] = useState({
    hostName: '',
    ip: '',
    groupid: '',
    templateid: ''
  });

  // Sample data for dropdowns - replace with actual API calls
  const [hostGroups] = useState([
    { groupid: '1', name: 'Linux servers' },
    { groupid: '2', name: 'Windows servers' },
    { groupid: '3', name: 'Network devices' },
    { groupid: '4', name: 'Database servers' },
  ]);

  const [templates] = useState([
    { templateid: '10001', name: 'Linux by Zabbix agent' },
    { templateid: '10081', name: 'Windows by Zabbix agent' },
    { templateid: '10047', name: 'Generic SNMP' },
    { templateid: '10186', name: 'MySQL by Zabbix agent' },
  ]);

  const theme = useTheme();

  const fetchHostsAndCounts = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) setRefreshing(true);
      else setLoading(true);

      const hostsResponse = await axios.post('http://localhost:9000/api/zabbix/hosts');
      const hostsData = hostsResponse.data;

      // Fetch counts for triggers, alerts, and problems for each host
      const hostPromises = hostsData.map(async (host) => {
        const [triggersResponse, alertsResponse, problemsResponse] = await Promise.all([
          axios.post('http://localhost:9000/api/zabbix/active-triggers', { hostid: host.hostid }),
          axios.post('http://localhost:9000/api/zabbix/alerts', { hostid: host.hostid }),
          axios.post('http://localhost:9000/api/zabbix/problems', { hostid: host.hostid }),
        ]);
        return {
          ...host,
          triggerCount: triggersResponse.data.length,
          alertCount: alertsResponse.data.length,
          problemCount: problemsResponse.data.length,
        };
      });

      const hostsWithCounts = await Promise.all(hostPromises);
      setHosts(hostsWithCounts);
      setError(null);
    } catch (err) {
      setError('Failed to load hosts or counts');
      console.error('Failed to load hosts or counts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHostsAndCounts();
  }, []);

  const handleRefresh = () => {
    fetchHostsAndCounts(true);
  };

  const handleOpenAddHostModal = () => {
    setOpenAddHostModal(true);
    setHostForm({
      hostName: '',
      ip: '',
      groupid: '',
      templateid: ''
    });
  };

  const handleCloseAddHostModal = () => {
    setOpenAddHostModal(false);
    setHostForm({
      hostName: '',
      ip: '',
      groupid: '',
      templateid: ''
    });
  };

  const handleFormChange = (field, value) => {
    setHostForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddHost = async () => {
    // Validate form
    if (!hostForm.hostName || !hostForm.ip || !hostForm.groupid || !hostForm.templateid) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    // Validate IP format (basic validation)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(hostForm.ip)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid IP address',
        severity: 'error'
      });
      return;
    }

    try {
      setAddingHost(true);
      
      const response = await axios.post('http://localhost:9000/api/zabbix/host-create', {
        hostName: hostForm.hostName,
        ip: hostForm.ip,
        groupid: hostForm.groupid,
        templateid: hostForm.templateid
      });

      if (response.data && response.data.hostids) {
        setSnackbar({
          open: true,
          message: `Host "${hostForm.hostName}" added successfully!`,
          severity: 'success'
        });
        
        // Close modal and refresh hosts list
        handleCloseAddHostModal();
        fetchHostsAndCounts(true);
      } else {
        throw new Error('Failed to create host');
      }
    } catch (err) {
      console.error('Error adding host:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to add host. Please try again.',
        severity: 'error'
      });
    } finally {
      setAddingHost(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Calculate summary statistics
  const totalHosts = hosts.length;
  const totalTriggers = hosts.reduce((sum, host) => sum + host.triggerCount, 0);
  const totalAlerts = hosts.reduce((sum, host) => sum + host.alertCount, 0);
  const totalProblems = hosts.reduce((sum, host) => sum + host.problemCount, 0);

  const getChipSeverity = (count, type) => {
    if (type === 'problems' || type === 'alerts') {
      if (count > 10) return 'high';
      if (count > 5) return 'medium';
      if (count > 0) return 'low';
      return 'info';
    }
    if (type === 'triggers') {
      if (count > 20) return 'high';
      if (count > 10) return 'medium';
      if (count > 0) return 'low';
      return 'info';
    }
    return 'info';
  };

  const getStatusIcon = (problemCount) => {
    if (problemCount === 0) return <CheckCircleIcon color="success" />;
    if (problemCount <= 5) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  if (loading) {
    return (
      <StyledContainer maxWidth="xl">
        <HeaderCard>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ color: theme.palette.primary.contrastText, mb: 2 }} />
            <Typography variant="h5">Loading HostSniper Surveillance Dashboard...</Typography>
          </CardContent>
        </HeaderCard>
        <StatsGridContainer>
          {[1, 2, 3, 4].map((item) => (
            <StatsCard key={item}>
              <CardContent>
                <Skeleton variant="circular" width={56} height={56} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" height={40} sx={{ mt: 2 }} />
                <Skeleton variant="text" height={20} />
              </CardContent>
            </StatsCard>
          ))}
        </StatsGridContainer>
        <StyledTableContainer component={Paper} elevation={0}>
          <Table>
            <StyledTableHead>
              <TableRow>
                {['Host Information', 'Host ID', 'Triggers', 'Alerts', 'Problems', 'Status', 'Actions'].map((header) => (
                  <StyledHeaderCell key={header}>
                    <Skeleton variant="text" height={20} />
                  </StyledHeaderCell>
                ))}
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {[1, 2, 3].map((row) => (
                <StyledTableRow key={row}>
                  {Array(7)
                    .fill()
                    .map((_, index) => (
                      <TableCell key={index}>
                        <Skeleton variant="text" height={30} />
                      </TableCell>
                    ))}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="xl">
      <Fade in={true} timeout={800}>
        <div>
          {/* Modern Header Card with Enhanced Design */}
          <HeaderCard sx={{
            background: `linear-gradient(145deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            borderBottom: `2px solid ${theme.palette.secondary.main}`
          }}>
            {refreshing && <RefreshProgressBar />}
            <CardContent sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2.5,
              px: 4,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.main} 100%)`,
                opacity: 0.7
              }
            }}>
              <Box sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Avatar sx={{
                  bgcolor: theme.palette.secondary.main,
                  width: 48,
                  height: 48,
                  boxShadow: theme.shadows[4]
                }}>
                  <ComputerIcon fontSize="medium" />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    background: `linear-gradient(90deg, #fff 0%, ${theme.palette.secondary.light} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    HostSniper Surveillance
                  </Typography>
                  <Typography variant="subtitle2" sx={{
                    color: 'rgba(255,255,255,0.85)',
                    fontStyle: 'italic',
                    letterSpacing: '0.3px'
                  }}>
                    Real-time Infrastructure Monitoring
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <AddHostButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddHostModal}
                  sx={{
                    backgroundColor: theme.palette.success.main,
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark,
                    }
                  }}
                >
                  Add Host
                </AddHostButton>

                <Tooltip title="Refresh Data" arrow>
                  <IconButton
                    onClick={handleRefresh}
                    sx={{
                      color: theme.palette.primary.contrastText,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      p: 1.5,
                      '&:hover': {
                        backgroundColor: theme.palette.secondary.main,
                        transform: 'rotate(360deg)',
                        boxShadow: `0 0 12px ${theme.palette.secondary.main}`
                      },
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: `1px solid rgba(255,255,255,0.1)`
                    }}
                  >
                    {refreshing ? (
                      <CircularProgress
                        size={24}
                        thickness={4}
                        sx={{
                          color: theme.palette.primary.contrastText,
                        }}
                      />
                    ) : (
                      <RefreshIcon sx={{ fontSize: '1.5rem' }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </HeaderCard>

          {/* Statistics Cards - Now using flex layout for better responsive behavior */}
          <StatsGridContainer>
            <StatsCard>
              <CardContent sx={{
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Avatar sx={{
                  bgcolor: theme.palette.primary.main,
                  mb: 2,
                  width: 56,
                  height: 56
                }}>
                  <ComputerIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {totalHosts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Hosts
                </Typography>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent sx={{
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Avatar sx={{
                  bgcolor: theme.palette.info.main,
                  mb: 2,
                  width: 56,
                  height: 56
                }}>
                  <TimelineIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {totalTriggers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Triggers
                </Typography>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent sx={{
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Avatar sx={{
                  bgcolor: theme.palette.warning.main,
                  mb: 2,
                  width: 56,
                  height: 56
                }}>
                  <NotificationsIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {totalAlerts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Alerts
                </Typography>
              </CardContent>
            </StatsCard>

            <StatsCard>
              <CardContent sx={{
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Avatar sx={{
                  bgcolor: theme.palette.error.main,
                  mb: 2,
                  width: 56,
                  height: 56
                }}>
                  <BugReportIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {totalProblems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Problems
                </Typography>
              </CardContent>
            </StatsCard>
          </StatsGridContainer>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: theme.shape.borderRadius,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: theme.palette.error.main,
                border: `1px solid ${theme.palette.error.main}`,
              }}
            >
              <Typography variant="body1">{error}</Typography>
            </Alert>
          )}

          {/* Hosts Table */}
          <Card sx={{ background: 'transparent', width: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <StyledTableHead>
                    <TableRow>
                      <StyledHeaderCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ComputerIcon sx={{ mr: 1 }} />
                          Host Information
                        </Box>
                      </StyledHeaderCell>
                      <StyledHeaderCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <StorageIcon sx={{ mr: 1 }} />
                          Host ID
                        </Box>
                      </StyledHeaderCell>
                      <StyledHeaderCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TimelineIcon sx={{ mr: 1 }} />
                          Triggers
                        </Box>
                      </StyledHeaderCell>
                      <StyledHeaderCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <NotificationsIcon sx={{ mr: 1 }} />
                          Alerts
                        </Box>
                      </StyledHeaderCell>
                      <StyledHeaderCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BugReportIcon sx={{ mr: 1 }} />
                          Problems
                        </Box>
                      </StyledHeaderCell>
                      <StyledHeaderCell align="center">Status</StyledHeaderCell>
                      <StyledHeaderCell align="center">Actions</StyledHeaderCell>
                    </TableRow>
                  </StyledTableHead>
                  <TableBody>
                    {hosts.map((host, index) => (
                      <Fade in={true} timeout={400 + index * 100} key={host.hostid}>
                        <StyledTableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  bgcolor: theme.palette.primary.main,
                                  mr: 2,
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                <ComputerIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="600">
                                  {host.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Infrastructure Host
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontFamily="monospace" fontWeight="500">
                              {host.hostid}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <StyledChip
                              label={host.triggerCount}
                              severity={getChipSeverity(host.triggerCount, 'triggers')}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <StyledChip
                              label={host.alertCount}
                              severity={getChipSeverity(host.alertCount, 'alerts')}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <StyledChip
                              label={host.problemCount}
                              severity={getChipSeverity(host.problemCount, 'problems')}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip
                              title={host.problemCount === 0 ? 'All systems normal' : `${host.problemCount} issues detected`}
                            >
                              {getStatusIcon(host.problemCount)}
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <ActionButton
                              component={Link}
                              to={`/host/${host.hostid}`}
                              variant="contained"
                              startIcon={<VisibilityIcon />}
                              size="small"
                            >
                              View Details
                            </ActionButton>
                          </TableCell>
                        </StyledTableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </CardContent>
          </Card>
        </div>
      </Fade>

      {/* Add Host Modal */}
      <StyledDialog
        open={openAddHostModal}
        onClose={handleCloseAddHostModal}
        maxWidth="md"
        fullWidth
      >
        <StyledDialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NetworkCheckIcon sx={{ mr: 2 }} />
            Add New Host
          </Box>
          <IconButton
            onClick={handleCloseAddHostModal}
            sx={{
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <StyledTextField
              label="Host Name"
              value={hostForm.hostName}
              onChange={(e) => handleFormChange('hostName', e.target.value)}
              fullWidth
              required
              placeholder="Enter host name (e.g., web-server-01)"
              helperText="Unique identifier for the host"
            />

            <StyledTextField
              label="IP Address"
              value={hostForm.ip}
              onChange={(e) => handleFormChange('ip', e.target.value)}
              fullWidth
              required
              placeholder="192.168.1.100"
              helperText="IP address of the host for monitoring"
            />

            <StyledFormControl fullWidth required>
              <InputLabel>Host Group</InputLabel>
              <Select
                value={hostForm.groupid}
                onChange={(e) => handleFormChange('groupid', e.target.value)}
                label="Host Group"
              >
                {hostGroups.map((group) => (
                  <MenuItem key={group.groupid} value={group.groupid}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>

            <StyledFormControl fullWidth required>
              <InputLabel>Template</InputLabel>
              <Select
                value={hostForm.templateid}
                onChange={(e) => handleFormChange('templateid', e.target.value)}
                label="Template"
              >
                {templates.map((template) => (
                  <MenuItem key={template.templateid} value={template.templateid}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>

            <Alert
              severity="info"
              sx={{
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                color: theme.palette.info.main,
                border: `1px solid ${theme.palette.info.main}`,
                borderRadius: theme.shape.borderRadius,
              }}
            >
              <AlertTitle>Connection Details</AlertTitle>
              The host will be configured with Zabbix Agent on port 10050. Make sure the target host has the Zabbix Agent installed and running.
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseAddHostModal}
            variant="outlined"
            sx={{
              borderColor: theme.palette.text.secondary,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.text.primary,
                color: theme.palette.text.primary,
              },
            }}
          >
            Cancel
          </Button>
          <ActionButton
            onClick={handleAddHost}
            variant="contained"
            startIcon={addingHost ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={addingHost}
            sx={{
              backgroundColor: theme.palette.success.main,
              '&:hover': {
                backgroundColor: theme.palette.success.dark,
              },
            }}
          >
            {addingHost ? 'Adding Host...' : 'Add Host'}
          </ActionButton>
        </DialogActions>
      </StyledDialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            backgroundColor: snackbar.severity === 'success' 
              ? 'rgba(46, 125, 50, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            color: snackbar.severity === 'success' 
              ? theme.palette.success.main 
              : theme.palette.error.main,
            border: `1px solid ${snackbar.severity === 'success' 
              ? theme.palette.success.main 
              : theme.palette.error.main}`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default Dashboard;