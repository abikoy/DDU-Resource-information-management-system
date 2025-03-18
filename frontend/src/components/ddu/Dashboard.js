import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResources: 0,
    availableResources: 0,
    pendingTransfers: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/resources/stats/ddu', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" gutterBottom>
            Welcome, {user?.fullName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            DDU Resource Management Dashboard
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Resource Statistics" />
          <CardContent>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Total Resources" 
                  secondary={stats.totalResources} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Available Resources" 
                  secondary={stats.availableResources} 
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Pending Transfers" 
                  secondary={stats.pendingTransfers} 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader title="Recent Activities" />
          <CardContent>
            <List>
              {/* Recent activities will be mapped here */}
              <ListItem>
                <ListItemText 
                  primary="No recent activities" 
                  secondary="Check back later for updates" 
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
