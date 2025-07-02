import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Badge,
  InputBase,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Person,
  Security,
  Brightness4,
  Brightness7,
  FullscreenExit,
  Fullscreen,
  Refresh,
  Warning,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  '&:focus-within': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
  },
  marginLeft: theme.spacing(2),
  width: '100%',
  maxWidth: 400,
  transition: 'all 0.2s ease-in-out',
  [theme.breakpoints.up('sm')]: {
    width: '300px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255, 255, 255, 0.7)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#ffffff',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1.2, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: '0.9rem',
    fontWeight: 500,
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.6)',
      opacity: 1,
    },
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 600,
  ...(status === 'online' && {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  }),
  ...(status === 'warning' && {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  }),
  ...(status === 'error' && {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  }),
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  zIndex: theme.zIndex.drawer + 1,
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const notifications = [
    { id: 1, type: 'error', title: 'Critical Alert', message: 'Server CPU usage above 90%', time: '2 min ago' },
    { id: 2, type: 'warning', title: 'Warning', message: 'High memory usage detected', time: '5 min ago' },
    { id: 3, type: 'info', title: 'Info', message: 'Backup completed successfully', time: '1 hour ago' },
    { id: 4, type: 'success', title: 'Success', message: 'System update installed', time: '2 hours ago' },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <Error sx={{ color: '#ef4444' }} />;
      case 'warning':
        return <Warning sx={{ color: '#f59e0b' }} />;
      case 'success':
        return <CheckCircle sx={{ color: '#10b981' }} />;
      default:
        return <Info sx={{ color: '#6366f1' }} />;
    }
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72, px: 3 }}>
        {/* Left Section - Menu and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{
              mr: 2,
              display: { sm: 'none' },
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
              },
            }}
          >
            <MenuIcon sx={{ color: '#ffffff' }} />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                color: '#ffffff',
                display: { xs: 'none', sm: 'block' },
                fontSize: '1.2rem',
              }}
            >
              HostSniper Surveillance
            </Typography>

          </Box>
        </Box>

        {/* Center Section - Search */}
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search hosts, alerts, metrics..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        {/* Right Section - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            <IconButton
              color="inherit"
              onClick={toggleFullscreen}
              sx={{
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                },
              }}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>

        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;