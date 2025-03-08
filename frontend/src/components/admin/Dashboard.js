import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {title}
        </Typography>
        <IconButton sx={{ color: color }}>
          {icon}
        </IconButton>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    visitorsToday: 0,
    loginsToday: 0,
    logoutsToday: 0,
    activeRate: '0%'
  });

  useEffect(() => {
    // TODO: Replace with actual API call
    // Simulating API data for now
    setStats({
      visitorsToday: 125,
      loginsToday: 85,
      logoutsToday: 42,
      activeRate: '68%'
    });
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Visitors Today"
            value={stats.visitorsToday}
            icon={<PeopleIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Logins Today"
            value={stats.loginsToday}
            icon={<LoginIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Logouts Today"
            value={stats.logoutsToday}
            icon={<LogoutIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Rate"
            value={stats.activeRate}
            icon={<TrendingUpIcon />}
            color="info.main"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
