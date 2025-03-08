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
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getAvatarUrl } from '../utils/avatarHelper';

const PendingApprovals = ({ onPendingCountUpdate }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmReject, setConfirmReject] = useState({ open: false, user: null });

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/v1/users/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pending users');
      }

      setPendingUsers(data.data.users);
      // Update the parent component with the count
      onPendingCountUpdate?.(data.data.users.length);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();

    // Set up polling for updates
    const interval = setInterval(fetchPendingUsers, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [onPendingCountUpdate]);

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/users/${userId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to approve user');
      }

      // Remove approved user from pending list
      setPendingUsers(prevUsers => {
        const newUsers = prevUsers.filter(user => user._id !== userId);
        onPendingCountUpdate?.(newUsers.length);
        return newUsers;
      });
      
      setSnackbar({
        open: true,
        message: 'User approved successfully',
        severity: 'success'
      });

      // Trigger refresh of approved users list
      window.dispatchEvent(new CustomEvent('userApproved'));
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleRejectClick = (user) => {
    setConfirmReject({ open: true, user });
  };

  const handleRejectConfirm = async () => {
    if (!confirmReject.user) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/users/${confirmReject.user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reject user');
      }

      // Remove rejected user from pending list
      setPendingUsers(prevUsers => {
        const newUsers = prevUsers.filter(user => user._id !== confirmReject.user._id);
        onPendingCountUpdate?.(newUsers.length);
        return newUsers;
      });

      setSnackbar({
        open: true,
        message: 'User rejected successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setConfirmReject({ open: false, user: null });
    }
  };

  const handleRejectCancel = () => {
    setConfirmReject({ open: false, user: null });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" component="h2">
            Pending Approvals
          </Typography>
          <Badge 
            badgeContent={pendingUsers.length} 
            color="error"
            sx={{ ml: 2 }}
          />
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchPendingUsers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : pendingUsers.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography>No pending approval requests</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar src={getAvatarUrl(user)}>
                      {user.fullName?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetails(true);
                        }}
                        title="View Details"
                      >
                        <InfoIcon />
                      </IconButton>
                      <IconButton
                        color="success"
                        onClick={() => handleApprove(user._id)}
                        title="Approve User"
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleRejectClick(user)}
                        title="Reject User"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Details Dialog */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>User Details</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    src={getAvatarUrl(selectedUser)}
                    sx={{ width: 100, height: 100 }}
                  >
                    {selectedUser.fullName?.charAt(0)}
                  </Avatar>
                </Box>
                <Typography variant="h6" align="center">
                  {selectedUser.fullName}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography>
                    <strong>Email:</strong> {selectedUser.email}
                  </Typography>
                  <Typography>
                    <strong>Department:</strong> {selectedUser.department}
                  </Typography>
                  <Typography>
                    <strong>Role:</strong> {selectedUser.role}
                  </Typography>
                  <Typography>
                    <strong>Registration Date:</strong>{' '}
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetails(false)}>Close</Button>
              <Button 
                color="success" 
                variant="contained"
                onClick={() => {
                  handleApprove(selectedUser._id);
                  setShowDetails(false);
                }}
              >
                Approve
              </Button>
              <Button 
                color="error" 
                variant="contained"
                onClick={() => {
                  handleRejectClick(selectedUser);
                  setShowDetails(false);
                }}
              >
                Reject
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={confirmReject.open}
        onClose={handleRejectCancel}
        aria-labelledby="reject-dialog-title"
        aria-describedby="reject-dialog-description"
      >
        <DialogTitle id="reject-dialog-title" sx={{ pb: 1 }}>
          Confirm User Rejection
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar src={getAvatarUrl(confirmReject.user)}>
              {confirmReject.user?.fullName?.charAt(0)}
            </Avatar>
            <Typography variant="subtitle1">
              {confirmReject.user?.fullName}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to reject this user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectCancel} color="inherit">
            No, Cancel
          </Button>
          <Button onClick={handleRejectConfirm} color="error" variant="contained" autoFocus>
            Yes, Reject User
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PendingApprovals;
