import React, { useState, useEffect } from 'react';
import {
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
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  Autocomplete
} from '@mui/material';

const ResourceTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    resourceId: '',
    userId: '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    fetchTransfers();
    fetchResources();
    fetchUsers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/transfers/ddu', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setTransfers(data.data.transfers);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
      showAlert('Error fetching transfers', 'error');
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/resources/ddu', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setResources(data.data.resources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users/staff', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/v1/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          department: 'DDU'
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        showAlert('Transfer created successfully', 'success');
        handleCloseDialog();
        fetchTransfers();
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      showAlert('Error creating transfer', 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      resourceId: '',
      userId: '',
      quantity: 1,
      notes: ''
    });
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r._id === resourceId);
    return resource ? resource.name : 'Unknown Resource';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.fullName : 'Unknown User';
  };

  return (
    <div>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
          <Grid item>
            <Typography variant="h6">Resource Transfers</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
            >
              New Transfer
            </Button>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Resource</TableCell>
                <TableCell>Staff Member</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell>{getResourceName(transfer.resourceId)}</TableCell>
                  <TableCell>{getUserName(transfer.userId)}</TableCell>
                  <TableCell>{transfer.quantity}</TableCell>
                  <TableCell>{transfer.status}</TableCell>
                  <TableCell>{new Date(transfer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{transfer.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Resource Transfer</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={resources}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, value) => setFormData({ ...formData, resourceId: value?._id || '' })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Resource"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => option.fullName}
                  onChange={(_, value) => setFormData({ ...formData, userId: value?._id || '' })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Staff Member"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Transfer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ResourceTransfers;
