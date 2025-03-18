import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import {
  Info as InfoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPendingUsers, getApprovedUsers, approveUser, deleteUser, updateUser } from '../../services/userService';

// Role color mapping
const roleColors = {
  admin: '#4caf50', // Green
  staff: '#2196f3', // Blue
  ddu: '#ff9800', // Orange
  iot: '#9c27b0'  // Purple
};

const Users = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    department: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // ascending or descending
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const [pendingResponse, approvedResponse] = await Promise.all([
        getPendingUsers(),
        getApprovedUsers()
      ]);
      setPendingUsers(pendingResponse.data.users);
      setApprovedUsers(approvedResponse.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user, type) => {
    setSelectedUser(user);
    setDialogType(type);
    if (type === 'edit') {
      setEditForm({
        fullName: user.fullName,
        email: user.email,
        department: user.department
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setDialogType('');
    setEditForm({
      fullName: '',
      email: '',
      department: ''
    });
  };

  const handleApprove = async () => {
    try {
      await approveUser(selectedUser._id);
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Error approving user');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUser._id);
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Error deleting user');
    }
  };

  const handleEdit = async () => {
    try {
      await updateUser(selectedUser._id, editForm);
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Error updating user');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditFormChange = (event) => {
    setEditForm({
      ...editForm,
      [event.target.name]: event.target.value
    });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  // Filtering and sorting logic
  const filteredUsers = (activeTab === 0 ? pendingUsers : approvedUsers)
    .filter((user) => {
      const nameMatch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const departmentMatch = user.department.toLowerCase().includes(selectedDepartment.toLowerCase());
      return nameMatch && (selectedDepartment ? departmentMatch : true);
    })
    .sort((a, b) => {
      const compareValue = (field) => (a[field] || '').localeCompare(b[field] || '');
      const sortedUsers = sortOrder === 'asc' ? compareValue : (a, b) => -compareValue(a, b);
      return sortedUsers('fullName');
    });

  const renderDialog = () => {
    switch (dialogType) {
      case 'info':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>
              User Information
              <Chip 
                label={selectedUser?.role.toUpperCase()}
                style={{ 
                  backgroundColor: roleColors[selectedUser?.role] || '#757575',
                  color: 'white',
                  marginLeft: '10px'
                }}
                size="small"
              />
            </DialogTitle>
            <DialogContent>
              <Typography><strong>Full Name:</strong> {selectedUser?.fullName}</Typography>
              <Typography><strong>Email:</strong> {selectedUser?.email}</Typography>
              <Typography><strong>Department:</strong> {selectedUser?.department}</Typography>
              <Typography><strong>Role:</strong> {selectedUser?.role}</Typography>
              {selectedUser?.approvedAt && (
                <Typography><strong>Approved At:</strong> {new Date(selectedUser.approvedAt).toLocaleString()}</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        );
      case 'edit':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Edit User</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Full Name"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditFormChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Department"
                  name="department"
                  value={editForm.department}
                  onChange={handleEditFormChange}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleEdit} color="primary" variant="contained">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        );
      case 'approve':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Confirm Approval</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to approve user {selectedUser?.fullName}?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleApprove} color="primary" variant="contained">
                Approve
              </Button>
            </DialogActions>
          </Dialog>
        );
      case 'delete':
        return (
          <Dialog open={openDialog} onClose={handleCloseDialog}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete user {selectedUser?.fullName}? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Pending Users" />
            <Tab label="Approved Users" />
          </Tabs>
        </Box>
      </Box>

      {/* Search Box and Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <TextField
          label="Search by Name or Department"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <FormControl fullWidth>
          <InputLabel>Filter by Department</InputLabel>
          <Select
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            label="Filter by Department"
          >
            <MenuItem value="">All Departments</MenuItem>
            {/* Add your department options here */}
            <MenuItem value="SOFTWARE">SOFTWARE</MenuItem>
            <MenuItem value="IOT">IOT</MenuItem>
            <MenuItem value="COMPUTER SCINCE">COMPUTER SCINCE</MenuItem>
            <MenuItem value="ELECTRICAL">ELECTRICAL</MenuItem>
            <MenuItem value="MECHANICAL">MECHANICAL</MenuItem>
            <MenuItem value="CIVIL">CIVIL</MenuItem>
            <MenuItem value="HEALTH">HEALTH</MenuItem>
            <MenuItem value="SPORT">SPORT</MenuItem>
            {/* etc */}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Sort Order</InputLabel>
          <Select
            value={sortOrder}
            onChange={handleSortChange}
            label="Sort Order"
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.toUpperCase()}
                      style={{
                        backgroundColor: roleColors[user.role] || '#757575',
                        color: 'white'
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user, 'info')}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    {activeTab === 0 ? (
                      <>
                        <Tooltip title="Approve User">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(user, 'approve')}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDialog(user, 'delete')}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(user, 'edit')}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDialog(user, 'delete')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No data found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {renderDialog()}
    </Container>
  );
};

export default Users;
