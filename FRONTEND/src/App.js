import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Dashboard from './components/Dashboard';
import HostPage from './components/HostPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HostDashboard from './components/HostDashboard';
import AddEditHost from './components/Host Config/HostConfig';


const createAppTheme = (mode) =>
  createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#6366f1',
        light: '#a5b4fc',
        dark: '#4338ca',
      },
      secondary: {
        main: '#10b981',
        light: '#6ee7b7',
        dark: '#059669',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
      },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#e2e8f0' : '#1e293b',
        secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h6: {
        fontWeight: 700,
        fontSize: '1.2rem',
      },
      body1: {
        fontSize: '0.95rem',
        fontWeight: 500,
      },
      body2: {
        fontSize: '0.85rem',
        fontWeight: 400,
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'dark' ? '#0f172a' : '#f8fafc',
            transition: 'background-color 0.2s ease-in-out',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

const App = () => {
  const [mode, setMode] = useState('dark');
  const theme = createAppTheme(mode);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Header onMenuClick={isMobile ? handleDrawerOpen : undefined} />
          <Sidebar
            open={isMobile ? drawerOpen : true}
            onClose={handleDrawerClose}
            variant={isMobile ? 'temporary' : 'permanent'}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              mt: 9, // Account for AppBar height
              backgroundColor: theme.palette.background.default,
              minHeight: '100vh',
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            <Routes>
              <Route path="/host-dashboard" element={<Dashboard />} />
              <Route path="/host/:hostid" element={<HostPage />} />
              <Route path="/" element={<HostDashboard />} />
              <Route path="/host-detail" element={<AddEditHost />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;