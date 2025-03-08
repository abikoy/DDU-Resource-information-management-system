import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  useTheme,
  Container,
  Grid,
  Paper,
  Button,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Profile from '../components/Profile';
import PendingApprovals from '../components/PendingApprovals';
import { getAvatarUrl } from '../utils/avatarHelper';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Users from '../components/admin/Users';
import Resources from '../components/admin/Resources';
import ActivityLogs from '../components/admin/ActivityLogs';
import UserRegistration from '../components/admin/UserRegistration';
import Dashboard from '../components/admin/Dashboard';

const DRAWER_WIDTH = 240;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [selectedSubMenu, setSelectedSubMenu] = useState('management');
  const [usersOpen, setUsersOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const theme = useTheme();

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleUsersClick = () => {
    setUsersOpen(!usersOpen);
  };

  const handleMenuClick = (menuId, subMenuId = null) => {
    setSelectedMenu(menuId);
    if (subMenuId) {
      setSelectedSubMenu(subMenuId);
    }
  };

  const handlePendingCountUpdate = (count) => {
    setPendingCount(count);
  };

  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
    {
      id: 'users',
      text: 'Users',
      icon: <PeopleIcon />,
      subItems: [
        { id: 'management', text: 'User Management', icon: <GroupIcon /> },
        { id: 'registration', text: 'User Registration', icon: <PersonAddIcon /> }
      ]
    },
    { id: 'resources', text: 'Resources', icon: <InventoryIcon /> },
    { id: 'logs', text: 'Activity Logs', icon: <AssessmentIcon /> },
    { id: 'approvals', text: 'Pending Approvals', icon: <Badge badgeContent={pendingCount} color="error" /> }
  ];

  const renderContent = () => {
    if (selectedMenu === 'dashboard') {
      return <Dashboard />;
    } else if (selectedMenu === 'users') {
      if (selectedSubMenu === 'management') {
        return <Users />;
      } else if (selectedSubMenu === 'registration') {
        return <UserRegistration />;
      }
    } else if (selectedMenu === 'resources') {
      return <Resources />;
    } else if (selectedMenu === 'logs') {
      return <ActivityLogs />;
    } else if (selectedMenu === 'approvals') {
      return <PendingApprovals onPendingCountUpdate={handlePendingCountUpdate} />;
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" color="primary" gutterBottom>
              Welcome, {user?.fullName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Admin Dashboard - Manage Users and System Settings
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DDU RMS - Admin Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleProfileOpen}>
            <Avatar 
              sx={{ bgcolor: 'secondary.main' }}
              src={getAvatarUrl(user)}
            >
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                {item.subItems ? (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton onClick={handleUsersClick}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                        {usersOpen ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={usersOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.subItems.map((subItem) => (
                          <ListItemButton
                            key={subItem.id}
                            sx={{ pl: 4 }}
                            selected={selectedMenu === item.id && selectedSubMenu === subItem.id}
                            onClick={() => handleMenuClick(item.id, subItem.id)}
                          >
                            <ListItemIcon>{subItem.icon}</ListItemIcon>
                            <ListItemText primary={subItem.text} />
                          </ListItemButton>
                        ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItemButton
                    selected={selectedMenu === item.id}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                )}
                {item.id === 'dashboard' && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {renderContent()}
      </Box>

      <Profile open={isProfileOpen} onClose={handleProfileClose} />
    </Box>
  );
};

export default AdminDashboard;
