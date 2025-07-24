import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Modal,
  TextField,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  AppBar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Fade,
  Backdrop,
  Paper,
  Grid,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Computer as ComputerIcon,
  Groups as GroupsIcon,
  Dashboard as DashboardIcon,
  Description as TemplateIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkCheckIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import HostSection from "./HostSection";
import HostGroupSection from "./HostGroupSection";
import TemplateSection from "./TemplateSection";
import ExpressionGenerator from "./ExpressionGenerator";

// Styled components
const ModalBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  width: "500px",
  maxHeight: "80vh",
  overflow: "auto",
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

const AddEditHost = () => {
  const [hosts, setHosts] = useState([]);
  const [hostGroups, setHostGroups] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [displayedTemplateCount, setDisplayedTemplateCount] = useState(10); // Track number of templates to display
  const [tabValue, setTabValue] = useState(0);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [hostFormData, setHostFormData] = useState({
    hostName: "",
    ip: "",
    groupid: "",
    templateid: "",
  });
  const [groupFormData, setGroupFormData] = useState({ name: "" });
  const [templateFormData, setTemplateFormData] = useState({
    templateName: "",
    groupid: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const templatesPerPage = 10; // Number of templates to display per "page"

  // Fetch all hosts using POST
  const fetchHosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:9000/api/zabbix/hosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      setHosts(data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch hosts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all host groups using GET
  const fetchHostGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:9000/api/zabbix/hostgroup-list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setHostGroups(data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch host groups");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all templates using GET (no pagination parameters)
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:9000/api/zabbix/template-list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setTemplates(data || []);
      setDisplayedTemplateCount(templatesPerPage); // Reset to show first 10 templates
      setError(null);
    } catch (err) {
      setError("Failed to fetch templates");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle load more templates (frontend only)
  const handleLoadMoreTemplates = () => {
    setDisplayedTemplateCount((prev) => prev + templatesPerPage);
  };

  // Fetch data on mount
  useEffect(() => {
    fetchHosts();
    fetchHostGroups();
    fetchTemplates();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle host form input changes
  const handleHostInputChange = (e) => {
    const { name, value } = e.target;
    setHostFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle host group form input changes
  const handleGroupInputChange = (e) => {
    const { name, value } = e.target;
    setGroupFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle template form input changes
  const handleTemplateInputChange = (e) => {
    const { name, value } = e.target;
    setTemplateFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle host form submission
  const handleHostSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:9000/api/zabbix/host-create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hostFormData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create host");
      }

      await fetchHosts();
      setIsHostModalOpen(false);
      setHostFormData({ hostName: "", ip: "", groupid: "", templateid: "" });
      setError(null);
    } catch (err) {
      setError("Failed to create host");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle host group form submission
  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:9000/api/zabbix/hostgroup-create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(groupFormData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create host group");
      }

      await fetchHostGroups();
      setIsGroupModalOpen(false);
      setGroupFormData({ name: "" });
      setError(null);
    } catch (err) {
      setError("Failed to create host group");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle template form submission
  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:9000/api/zabbix/template-create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templateFormData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create template");
      }

      await fetchTemplates(); // Refresh all templates
      setIsTemplateModalOpen(false);
      setTemplateFormData({ templateName: "", groupid: "" });
      setError(null);
    } catch (err) {
      setError("Failed to create template");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInventoryModeLabel = (mode) => {
    switch (mode) {
      case "1":
        return "Automatic";
      case "0":
        return "Manual";
      default:
        return "Disabled";
    }
  };

  const getInventoryModeColor = (mode) => {
    switch (mode) {
      case "1":
        return "success";
      case "0":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header Section */}
      <HeaderBox>
        <DashboardIcon sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Host Config Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Manage your Zabbix hosts, host groups, and templates efficiently
          </Typography>
        </Box>
      </HeaderBox>

      {/* Tabs Navigation */}
      <Paper elevation={1} sx={{ mb: 2, borderRadius: 1, overflow: "hidden" }}>
        <AppBar position="static" color="default" elevation={0}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              "& .MuiTab-root": {
                fontSize: "0.9rem",
                fontWeight: 600,
                minHeight: 48,
                textTransform: "none",
              },
            }}
          >
            <Tab
              icon={<ComputerIcon />}
              label="Hosts"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<GroupsIcon />}
              label="Host Groups"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<TemplateIcon />}
              label="Templates"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
            <Tab
              icon={<TemplateIcon />}
              label="Expression Generator"
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          </Tabs>
        </AppBar>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 1 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Sections */}
      {tabValue === 0 && (
        <HostSection
          hosts={hosts}
          loading={loading}
          onAddHostClick={() => setIsHostModalOpen(true)}
          getInventoryModeLabel={getInventoryModeLabel}
          getInventoryModeColor={getInventoryModeColor}
        />
      )}
      {tabValue === 1 && (
        <HostGroupSection
          hostGroups={hostGroups}
          loading={loading}
          onAddGroupClick={() => setIsGroupModalOpen(true)}
        />
      )}
      {tabValue === 2 && (
        <TemplateSection
          templates={templates}
          displayedTemplateCount={displayedTemplateCount}
          loading={loading}
          onAddTemplateClick={() => setIsTemplateModalOpen(true)}
          onLoadMoreClick={handleLoadMoreTemplates}
          hasMore={displayedTemplateCount < templates.length}
        />
      )}
      {tabValue === 3 && <ExpressionGenerator />}

      {/* Host Modal */}
      <Modal
        open={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={isHostModalOpen}>
          <ModalBox>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <ComputerIcon color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="h5" component="h2" fontWeight="600">
                Add New Host
              </Typography>
              <IconButton
                onClick={() => setIsHostModalOpen(false)}
                sx={{ ml: "auto" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box component="form" onSubmit={handleHostSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Host Name"
                    name="hostName"
                    value={hostFormData.hostName}
                    onChange={handleHostInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <StorageIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="IP Address"
                    name="ip"
                    value={hostFormData.ip}
                    onChange={handleHostInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <NetworkCheckIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="groupid-label">Host Group</InputLabel>
                    <Select
                      labelId="groupid-label"
                      name="groupid"
                      value={hostFormData.groupid}
                      label="Host Group"
                      onChange={handleHostInputChange}
                      startAdornment={
                        <GroupsIcon color="action" sx={{ mr: 1 }} />
                      }
                    >
                      {hostGroups.map((group) => (
                        <MenuItem key={group.groupid} value={group.groupid}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <GroupsIcon fontSize="small" />
                            {group.name} (ID: {group.groupid})
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="templateid-label">Template</InputLabel>
                    <Select
                      labelId="templateid-label"
                      name="templateid"
                      value={hostFormData.templateid}
                      label="Template"
                      onChange={handleHostInputChange}
                      startAdornment={
                        <TemplateIcon color="action" sx={{ mr: 1 }} />
                      }
                    >
                      {templates.map((template) => (
                        <MenuItem
                          key={template.templateid}
                          value={template.templateid}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TemplateIcon fontSize="small" />
                            {template.name} (ID: {template.templateid})
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={() => setIsHostModalOpen(false)}
                  size="medium"
                  sx={{ px: 2, textTransform: "none" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <AddIcon />
                  }
                  size="medium"
                  sx={{ px: 2, textTransform: "none" }}
                >
                  {loading ? "Creating..." : "Create Host"}
                </Button>
              </Box>
            </Box>
          </ModalBox>
        </Fade>
      </Modal>

      {/* Host Group Modal */}
      <Modal
        open={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={isGroupModalOpen}>
          <ModalBox>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <GroupsIcon color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="h5" component="h2" fontWeight="600">
                Add New Host Group
              </Typography>
              <IconButton
                onClick={() => setIsGroupModalOpen(false)}
                sx={{ ml: "auto" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box component="form" onSubmit={handleGroupSubmit}>
              <TextField
                fullWidth
                label="Host Group Name"
                name="name"
                value={groupFormData.name}
                onChange={handleGroupInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <GroupsIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={() => setIsGroupModalOpen(false)}
                  size="medium"
                  sx={{ px: 2, textTransform: "none" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <AddIcon />
                  }
                  size="medium"
                  sx={{ px: 2, textTransform: "none" }}
                >
                  {loading ? "Creating..." : "Create Group"}
                </Button>
              </Box>
            </Box>
          </ModalBox>
        </Fade>
      </Modal>

      {/* Template Modal */}
      <Modal
        open={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={isTemplateModalOpen}>
          <ModalBox>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <TemplateIcon color="primary" sx={{ fontSize: 24 }} />
              <Typography variant="h5" component="h2" fontWeight="600">
                Add New Template
              </Typography>
              <IconButton
                onClick={() => setIsTemplateModalOpen(false)}
                sx={{ ml: "auto" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box component="form" onSubmit={handleTemplateSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Template Name"
                    name="templateName"
                    value={templateFormData.templateName}
                    onChange={handleTemplateInputChange}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <TemplateIcon color="action" sx={{ mr: 1 }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="groupid-label">Host Group</InputLabel>
                    <Select
                      labelId="groupid-label"
                      name="groupid"
                      value={templateFormData.groupid}
                      label="Host Group"
                      onChange={handleTemplateInputChange}
                      startAdornment={
                        <GroupsIcon color="action" sx={{ mr: 1 }} />
                      }
                    >
                      {hostGroups.map((group) => (
                        <MenuItem key={group.groupid} value={group.groupid}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <GroupsIcon fontSize="small" />
                            {group.name} (ID: {group.groupid})
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={() => setIsTemplateModalOpen(false)}
                  size="medium"
                  sx={{ px: 2, textTransform: "none" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <AddIcon />
                  }
                  size="medium"
                  sx={{ px: 2, textTransform: "none" }}
                >
                  {loading ? "Creating..." : "Create Template"}
                </Button>
              </Box>
            </Box>
          </ModalBox>
        </Fade>
      </Modal>
    </Container>
  );
};

export default AddEditHost;
