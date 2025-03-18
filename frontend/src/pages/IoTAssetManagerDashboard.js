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
  Divider,
  useTheme,
  Container,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Profile from '../components/Profile';
import { getAvatarUrl } from '../utils/avatarHelper';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HistoryIcon from '@mui/icons-material/History';
import Dashboard from '../components/iot/Dashboard';
import ResourceManagement from '../components/iot/ResourceManagement';
import ResourceTransfers from '../components/iot/ResourceTransfers';
import TransferHistory from '../components/iot/TransferHistory';

const DRAWER_WIDTH = 240;

const IoTAssetManagerDashboard = () => {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const theme = useTheme();

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleMenuClick = (menuId) => {
    setSelectedMenu(menuId);
  };

  const menuItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'resources', text: 'Resource Management', icon: <InventoryIcon /> },
    { id: 'transfers', text: 'Resource Transfers', icon: <SwapHorizIcon /> },
    { id: 'history', text: 'Transfer History', icon: <HistoryIcon /> }
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return <Dashboard />;
      case 'resources':
        return <ResourceManagement />;
      case 'transfers':
        return <ResourceTransfers />;
      case 'history':
        return <TransferHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DDU RMS - IoT Asset Manager
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
                <ListItemButton
                  selected={selectedMenu === item.id}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
                {item.id === 'dashboard' && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          mt: '64px'
        }}
      >
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </Box>

      <Profile
        open={isProfileOpen}
        onClose={handleProfileClose}
        user={user}
      />
    </Box>
  );
};

export default IoTAssetManagerDashboard;