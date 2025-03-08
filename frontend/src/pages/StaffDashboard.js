import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Avatar
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Profile from '../components/Profile';
import { getAllResources, transferResource } from '../services/resourceService';
import { getAvatarUrl } from '../utils/avatarHelper';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await getAllResources();
      // Filter resources assigned to current user
      setResources(response.data.resources.filter(
        resource => resource.assignedTo?._id === user._id
      ));
    } catch (error) {
      setError('Failed to fetch resources');
    }
  };

  const handleTransferClick = (resource) => {
    setSelectedResource(resource);
    setTransferDialogOpen(true);
  };

  const handleTransferClose = () => {
    setTransferDialogOpen(false);
    setSelectedResource(null);
    setTransferEmail('');
  };

  const handleTransfer = async () => {
    try {
      if (!transferEmail.endsWith('@ddu.edu.et')) {
        setError('Please enter a valid DDU email address');
        return;
      }

      await transferResource(selectedResource._id, transferEmail);
      setSuccess('Resource transfer request submitted successfully');
      handleTransferClose();
      fetchResources();
    } catch (error) {
      setError('Failed to transfer resource');
    }
  };

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError('Failed to logout');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DDU RMS - Staff Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleProfileOpen}>
            <Avatar 
              sx={{ bgcolor: 'secondary.main' }}
              src={getAvatarUrl(user)}
            >
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography component="h1" variant="h4" color="primary" gutterBottom>
                Welcome, {user?.fullName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Staff Dashboard - Manage Your Resources
              </Typography>
            </Paper>
          </Grid>

          {/* Messages */}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
            </Grid>
          )}
          {success && (
            <Grid item xs={12}>
              <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
            </Grid>
          )}

          {/* My Resources Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                My Resources
              </Typography>

              {resources.length === 0 ? (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  No resources are currently assigned to you.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resources.map((resource) => (
                        <TableRow key={resource._id}>
                          <TableCell>{resource.name}</TableCell>
                          <TableCell>{resource.type}</TableCell>
                          <TableCell>{resource.category}</TableCell>
                          <TableCell>{resource.location}</TableCell>
                          <TableCell>{resource.status}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleTransferClick(resource)}
                            >
                              Transfer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onClose={handleTransferClose}>
        <DialogTitle>Transfer Resource</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Transfer {selectedResource?.name} to another staff member
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Recipient's DDU Email"
            type="email"
            fullWidth
            variant="outlined"
            value={transferEmail}
            onChange={(e) => setTransferEmail(e.target.value)}
            helperText="Enter the DDU email address of the recipient"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransferClose}>Cancel</Button>
          <Button onClick={handleTransfer} variant="contained">
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Profile open={isProfileOpen} onClose={handleProfileClose} />
    </Box>
  );
};

export default StaffDashboard;
