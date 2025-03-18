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
  Alert,
  Chip,
  Box,
  Tooltip
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TransferHistory = () => {
  const [transfers, setTransfers] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState('all');
  const [resourceId, setResourceId] = useState('all');
  const [resourceType, setResourceType] = useState('all');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTransferHistory();
    fetchResources();
    fetchUsers();
  }, [startDate, endDate, status, resourceId, resourceType]);

  const fetchTransferHistory = async () => {
    try {
      let url = 'http://localhost:5000/api/v1/transfers/history/iot';
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate.toISOString());
      if (endDate) queryParams.append('endDate', endDate.toISOString());
      if (status !== 'all') queryParams.append('status', status);
      if (resourceId !== 'all') queryParams.append('resourceId', resourceId);
      if (resourceType !== 'all') queryParams.append('resourceType', resourceType);

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
      const response = await fetch('http://localhost:5000/api/v1/resources/iot', {
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

  const getResourceSpecs = (resourceId) => {
    const resource = resources.find(r => r._id === resourceId);
    return resource ? resource.specifications : '';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? user.fullName : 'Unknown User';
  };

  const showAlert = (message, severity) => {
    setAlert({ open: true, message, severity });
  };

  const getStatusChipColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          IoT Transfer History
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Resource Type"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="software">Software</MenuItem>
              <MenuItem value="it_resources">IT Resources</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Resource"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
            >
              <MenuItem value="all">All Resources</MenuItem>
              {resources.map((resource) => (
                <MenuItem key={resource._id} value={resource._id}>
                  {resource.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" onClick={fetchTransferHistory}>
              Filter
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
                <TableCell>Technical Details</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell>{new Date(transfer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body1">
                        {getResourceName(transfer.resourceId)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {getResourceSpecs(transfer.resourceId)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getUserName(transfer.userId)}</TableCell>
                  <TableCell>{transfer.quantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={transfer.status}
                      color={getStatusChipColor(transfer.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={transfer.technicalRequirements || 'No technical requirements'}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {transfer.technicalRequirements || 'N/A'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
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
