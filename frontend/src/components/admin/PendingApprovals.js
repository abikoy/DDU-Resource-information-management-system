import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { approveUser, deleteUser, getPendingUsers } from '../../services/userService';

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, userId: null });

  const fetchPendingUsers = async () => {
    try {
      const response = await getPendingUsers();
      setPendingUsers(response.data.users);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await approveUser(userId);
      setPendingUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      setSnackbar({
        open: true,
        message: 'User approved successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to approve user',
        severity: 'error'
      });
    }
  };

  const handleReject = async (userId) => {
    try {
      await deleteUser(userId);
      setPendingUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      setSnackbar({
        open: true,
        message: 'User rejected successfully',
        severity: 'success'
      });
      setConfirmDialog({ open: false, userId: null });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to reject user',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Pending Approval Requests
      </Typography>

      {pendingUsers.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography>No pending approvals</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleApprove(user._id)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={() => setConfirmDialog({ open: true, userId: user._id })}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, userId: null })}
      >
        <DialogTitle>Confirm Rejection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, userId: null })}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleReject(confirmDialog.userId)}
            color="error"
            variant="contained"
            autoFocus
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingApprovals;
