import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/Profile';
import { getAvatarUrl } from '../utils/avatarHelper';

const AssetManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newResource, setNewResource] = useState({
    name: '',
    type: '',
    category: '',
    description: '',
    quantity: '',
    location: ''
  });

  useEffect(() => {
    // Check if user is logged in and is an asset manager
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'assetManager') {
      navigate('/');
      return;
    }
    fetchResources();
  }, [user, navigate]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/v1/resources', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setResources(data.data?.resources || []);
      } else {
        setError('Failed to fetch resources');
      }
    } catch (error) {
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleAddResourceOpen = () => {
    setIsAddResourceOpen(true);
  };

  const handleAddResourceClose = () => {
    setIsAddResourceOpen(false);
    setNewResource({
      name: '',
      type: '',
      category: '',
      description: '',
      quantity: '',
      location: ''
    });
  };

  const handleResourceChange = (e) => {
    setNewResource({
      ...newResource,
      [e.target.name]: e.target.value
    });
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/v1/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newResource)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Resource added successfully');
        handleAddResourceClose();
        fetchResources();
      } else {
        setError(data.message || 'Failed to add resource');
      }
    } catch (error) {
      setError('Error connecting to the server');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to logout');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DDU RMS - Asset Manager Dashboard
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
                Asset Manager Dashboard - Manage University Resources
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

          {/* Resources Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" variant="h6" color="primary">
                  Resources
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddResourceOpen}
                >
                  Add New Resource
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resources.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            No resources found
                          </TableCell>
                        </TableRow>
                      ) : (
                        resources.map((resource) => (
                          <TableRow key={resource._id}>
                            <TableCell>{resource.name}</TableCell>
                            <TableCell>{resource.type}</TableCell>
                            <TableCell>{resource.category}</TableCell>
                            <TableCell>{resource.description}</TableCell>
                            <TableCell>{resource.quantity}</TableCell>
                            <TableCell>{resource.location}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Add Resource Dialog */}
      <Dialog open={isAddResourceOpen} onClose={handleAddResourceClose}>
        <DialogTitle>Add New Resource</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Resource Name"
            fullWidth
            value={newResource.name}
            onChange={handleResourceChange}
          />
          <TextField
            margin="dense"
            name="type"
            label="Type"
            fullWidth
            value={newResource.type}
            onChange={handleResourceChange}
          />
          <TextField
            margin="dense"
            name="category"
            label="Category"
            fullWidth
            value={newResource.category}
            onChange={handleResourceChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newResource.description}
            onChange={handleResourceChange}
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={newResource.quantity}
            onChange={handleResourceChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            value={newResource.location}
            onChange={handleResourceChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddResourceClose}>Cancel</Button>
          <Button onClick={handleAddResource} variant="contained" color="primary">
            Add Resource
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Profile
        open={isProfileOpen}
        onClose={handleProfileClose}
        user={user}
      />
    </Box>
  );
};

export default AssetManagerDashboard;
