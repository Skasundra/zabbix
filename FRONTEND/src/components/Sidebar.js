import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Collapse,
    Divider,
    Chip,
    Avatar,
    IconButton,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    NotificationsActive as AlertIcon,
    Settings as SettingsIcon,
    Announcement as AnnouncementIcon,
    Timeline as TimelineIcon,
    Help as HelpIcon,
    ExpandLess,
    ExpandMore,
    Shield,
    AccountCircle,
    Brightness4,
    Brightness7,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const drawerWidth = 280;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', badge: null },
];

const alertSubmenu = [
    { text: 'Alert Rules', path: '/alerts/rules', icon: <SettingsIcon /> },
    { text: 'Notifications', path: '/alerts/notifications', icon: <AnnouncementIcon /> },
    { text: 'History', path: '/alerts/history', icon: <TimelineIcon /> },
];

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: '#e2e8f0',
        borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.2)',
        [theme.breakpoints.down('sm')]: {
            width: 72,
            '& .MuiListItemText-root': {
                display: 'none',
            },
            '& .MuiDrawer-paper': {
                width: 72,
            },
        },
    },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
    borderRadius: 10,
    margin: '4px 8px',
    padding: '10px 16px',
    backgroundColor: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
    color: active ? '#a5b4fc' : '#94a3b8',
    border: active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
    '&:hover': {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        color: '#a5b4fc',
        transform: 'translateX(4px)',
    },
    transition: 'all 0.2s ease-in-out',
    '& .MuiListItemIcon-root': {
        color: active ? '#a5b4fc' : '#94a3b8',
        minWidth: 40,
    },
}));

const Sidebar = () => {
    const location = useLocation();
    const [openSubmenus, setOpenSubmenus] = useState({});
    const [alertCenterOpen, setAlertCenterOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const handleSubmenuToggle = (text) => {
        setOpenSubmenus((prev) => ({
            ...prev,
            [text]: !prev[text],
        }));
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const isActive = (path) => location.pathname === path;
    const isSubmenuActive = (submenu) => submenu.some((item) => location.pathname === item.path);

    return (
        <StyledDrawer variant="permanent">

            <List sx={{ px: 2, py: 0, flexGrow: 1, mt: 10 }}>
                {menuItems.map((item) => (
                    <Box key={item.text}>
                        <ListItem disablePadding sx={{ mb: 1 }}>
                            <StyledListItemButton
                                component={item.hasSubmenu ? 'div' : Link}
                                to={!item.hasSubmenu ? item.path : undefined}
                                onClick={item.hasSubmenu ? () => handleSubmenuToggle(item.text) : undefined}
                                active={isActive(item.path) || (item.hasSubmenu && isSubmenuActive(item.submenu))}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: 14,
                                        fontWeight: isActive(item.path) || (item.hasSubmenu && isSubmenuActive(item.submenu)) ? 600 : 500,
                                    }}
                                />
                                {item.badge && (
                                    <Chip
                                        label={item.badge}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#10b981',
                                            color: '#fff',
                                            fontSize: '0.7rem',
                                            height: 18,
                                        }}
                                    />
                                )}
                                {item.hasSubmenu && (openSubmenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                            </StyledListItemButton>
                        </ListItem>
                        {item.hasSubmenu && (
                            <Collapse in={openSubmenus[item.text]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.submenu.map((subItem) => (
                                        <ListItem key={subItem.text} disablePadding sx={{ pl: 3, mb: 0.5 }}>
                                            <StyledListItemButton
                                                component={Link}
                                                to={subItem.path}
                                                active={isActive(subItem.path)}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32 }}>{subItem.icon}</ListItemIcon>
                                                <ListItemText
                                                    primary={subItem.text}
                                                    primaryTypographyProps={{
                                                        fontSize: 13,
                                                        fontWeight: isActive(subItem.path) ? 600 : 400,
                                                    }}
                                                />
                                            </StyledListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </Box>
                ))}

                {/* Alert Center Section */}
         
            </List>

            {/* Bottom Section */}
            <Box sx={{ p: 2 }}>
                <Divider sx={{ backgroundColor: 'rgba(148, 163, 184, 0.1)', my: 2 }} />
                <ListItem disablePadding sx={{ mb: 2 }}>
                    <StyledListItemButton>
                        <ListItemIcon>
                            <HelpIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Help & Support"
                            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                        />
                    </StyledListItemButton>
                </ListItem>
                <Box
                    sx={{
                        textAlign: 'center',
                        p: 2,
                        borderRadius: '8px',
                        background: 'rgba(148, 163, 184, 0.05)',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#64748b',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                        }}
                    >
                        © 2025 Netclues
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#475569',
                            fontSize: '0.7rem',
                            display: 'block',
                            mt: 0.5,
                        }}
                    >
                        Cyber Central v2.1.0
                    </Typography>
                </Box>
            </Box>
        </StyledDrawer>
    );
};

export default Sidebar;