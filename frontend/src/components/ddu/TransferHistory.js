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
  Grid,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TransferHistory = () => {
  const [transfers, setTransfers] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    status: 'all',
    resourceId: 'all'
  });
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const statusOptions = ['all', 'pending', 'approved', 'rejected', 'completed'];

  useEffect(() => {
    fetchTransferHistory();
    fetchResources();
    fetchUsers();
  }, [filters]);

  const fetchTransferHistory = async () => {
    try {
      let url = 'http://localhost:5000/api/v1/transfers/history/ddu';
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.resourceId !== 'all') queryParams.append('resourceId', filters.resourceId);

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setTransfers(data.data.transfers);
      }
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      showAlert('Error fetching transfer history', 'error');
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

  const handleUpdateStatus = async (transferId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/transfers/${transferId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.status === 'success') {
        showAlert('Transfer status updated successfully', 'success');
        fetchTransferHistory();
      }
    } catch (error) {
      console.error('Error updating transfer status:', error);
      showAlert('Error updating transfer status', 'error');
    }
  };

  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r._id === resourceId);
    return resource ? resource.name : 'Unknown Resource';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.fullName : 'Unknown User';
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      status: 'all',
      resourceId: 'all'
    });
  };

  return (
    <div>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Transfer History
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Resource"
              value={filters.resourceId}
              onChange={(e) => handleFilterChange('resourceId', e.target.value)}
            >
              <MenuItem value="all">All Resources</MenuItem>
              {resources.map((resource) => (
                <MenuItem key={resource._id} value={resource._id}>
                  {resource.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              sx={{ height: '100%' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Staff Member</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell>{new Date(transfer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{getResourceName(transfer.resourceId)}</TableCell>
                  <TableCell>{getUserName(transfer.userId)}</TableCell>
                  <TableCell>{transfer.quantity}</TableCell>
                  <TableCell>{transfer.status}</TableCell>
                  <TableCell>{transfer.notes}</TableCell>
                  <TableCell>
                    {transfer.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleUpdateStatus(transfer._id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleUpdateStatus(transfer._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {transfer.status === 'approved' && (
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleUpdateStatus(transfer._id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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

export default TransferHistory;
