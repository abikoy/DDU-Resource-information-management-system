import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  TablePagination,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import ResourceRegistrationForm from './ResourceRegistrationForm';
import ResourceDetails from './ResourceDetails';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import axiosInstance from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const AssetManagement = ({ department = '', isAdmin = false }) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [view, setView] = useState('main');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    resource: null
  });
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    assetType: '',
    status: '',
    department: ''
  });

  // Sort states
  const [sort, setSort] = useState({
    field: '',
    direction: 'asc'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
  }, [department, isAdmin]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/resources');
      console.log('Resources response:', response.data); // Debug log

      if (response.data.status === 'success' && response.data.data.resources) {
        const filteredResources = isAdmin 
          ? response.data.data.resources
          : response.data.data.resources.filter(resource => 
              resource.department.toUpperCase() === department.toUpperCase()
            );

        setResources(filteredResources);
      } else {
        console.error('Unexpected response format:', response.data);
        setNotification({
          open: true,
          message: 'Error: Unexpected response format from server',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Error fetching resources',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async (resourceData) => {
    try {
      // Debug log to see what's being sent
      console.log('Creating resource with data:', {
        ...resourceData,
        department
      });

      // Validate required fields
      const requiredFields = ['assetName', 'assetType', 'assetClass', 'location', 'quantity', 'unitPrice'];
      const missingFields = requiredFields.filter(field => {
        if (field === 'unitPrice') {
          return !resourceData.unitPrice || 
                 !resourceData.unitPrice.birr || 
                 !resourceData.unitPrice.cents;
        }
        return !resourceData[field];
      });

      if (missingFields.length > 0) {
        setNotification({
          open: true,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          severity: 'error'
        });
        return;
      }

      // Format the data
      const formattedData = {
        ...resourceData,
        department,  // Use the department prop directly
        status: 'Not Assigned',
        unitPrice: {
          birr: Number(resourceData.unitPrice.birr),
          cents: Number(resourceData.unitPrice.cents)
        },
        quantity: Number(resourceData.quantity)
      };

      // Log the formatted data
      console.log('Sending formatted data:', formattedData);

      // Send request
      const response = await axiosInstance.post('/resources', formattedData);

      if (response.data.status === 'success') {
        setNotification({
          open: true,
          message: 'Resource created successfully',
          severity: 'success'
        });
        await fetchResources(); // Refresh the list
        setView('main');
      }
    } catch (error) {
      console.error('Error creating resource:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.join(', ');
        setNotification({
          open: true,
          message: `Validation error: ${errorMessages}`,
          severity: 'error'
        });
      } else {
        setNotification({
          open: true,
          message: error.response?.data?.message || 'Error creating resource',
          severity: 'error'
        });
      }
    }
  };

  const handleUpdateResource = async (id, resourceData) => {
    try {
      const response = await axiosInstance.patch(`/resources/${id}`, resourceData);

      if (response.data.status === 'success') {
        setNotification({
          open: true,
          message: 'Resource updated successfully',
          severity: 'success'
        });
        fetchResources();
        setView('main');
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Error updating resource',
        severity: 'error'
      });
    }
  };

  const handleDeleteResource = async () => {
    try {
      if (!deleteDialog.resource) return;

      await axiosInstance.delete(`/resources/${deleteDialog.resource._id}`);
      setNotification({
        open: true,
        message: 'Resource deleted successfully',
        severity: 'success'
      });
      fetchResources();
    } catch (error) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Error deleting resource',
        severity: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, resource: null });
    }
  };

  // Filter resources based on current filters
  const filteredResources = resources.filter(resource => {
    const searchMatch = !filters.search || 
      resource.assetName.toLowerCase().includes(filters.search.toLowerCase()) ||
      (resource.serialNumber && resource.serialNumber.toLowerCase().includes(filters.search.toLowerCase())) ||
      resource.assetClass.toLowerCase().includes(filters.search.toLowerCase()) ||
      (resource.location && resource.location.toLowerCase().includes(filters.search.toLowerCase()));

    const assetTypeMatch = !filters.assetType || resource.assetType === filters.assetType;
    const statusMatch = !filters.status || resource.status === filters.status;
    const departmentMatch = !filters.department || resource.department === filters.department;

    return searchMatch && assetTypeMatch && statusMatch && departmentMatch;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (!sort.field) return 0;
    
    const aValue = a[sort.field];
    const bValue = b[sort.field];
    
    if (sort.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get paginated resources
  const paginatedResources = sortedResources.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleSort = (field) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleView = (resource) => {
    if (resource && resource._id) {
      navigate(`/resources/${resource._id}`);
    }
  };

  if (view === 'create') {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setView('main')}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Back to List
        </Button>
        <ResourceRegistrationForm
          onSubmit={handleCreateResource}
          department={department}
          isAdmin={isAdmin}
        />
      </Box>
    );
  }

  if (view === 'edit' && selectedResource) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            setView('main');
            setSelectedResource(null);
          }}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          Back to List
        </Button>
        <ResourceRegistrationForm
          onSubmit={(data) => handleUpdateResource(selectedResource._id, data)}
          initialData={selectedResource}
          department={department}
          isAdmin={isAdmin}
          isEdit
        />
      </Box>
    );
  }

  if (view === 'details' && selectedResource) {
    return (
      <ResourceDetails
        resource={selectedResource}
        onBack={() => {
          setView('main');
          setSelectedResource(null);
        }}
        onEdit={() => setView('edit')}
        onDelete={() => setDeleteDialog({ open: true, resource: selectedResource })}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Asset Management
        </Typography>
        {!isAdmin && (
          <Button
            startIcon={<AddIcon />}
            onClick={() => setView('create')}
            variant="contained"
          >
            Add New Asset
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Asset Type</InputLabel>
            <Select
              value={filters.assetType}
              onChange={(e) => handleFilterChange('assetType', e.target.value)}
              label="Asset Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="room_furniture">Room Furniture</MenuItem>
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="software">Software</MenuItem>
              <MenuItem value="office_supplies">Office Supplies</MenuItem>
              <MenuItem value="it_resources">IT Resources</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Not Assigned">Not Assigned</MenuItem>
              <MenuItem value="Assigned">Assigned</MenuItem>
              <MenuItem value="In Maintenance">In Maintenance</MenuItem>
              <MenuItem value="Retired">Retired</MenuItem>
            </Select>
          </FormControl>
          {isAdmin && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="DDU">DDU</MenuItem>
                <MenuItem value="IoT">IoT</MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>
      </Paper>

      {/* Resources Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => handleSort('assetName')}
                  >
                    Asset Name
                    {sort.field === 'assetName' && (
                      sort.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                    )}
                  </Box>
                </TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Asset Class</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No resources found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResources.map((resource) => (
                  <TableRow key={resource._id}>
                    <TableCell>{resource.assetName}</TableCell>
                    <TableCell>{resource.serialNumber}</TableCell>
                    <TableCell>{resource.assetClass}</TableCell>
                    <TableCell>
                      <Chip 
                        label={resource.assetType.replace('_', ' ')}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{resource.location}</TableCell>
                    <TableCell>
                      <Chip 
                        label={resource.status}
                        color={
                          resource.status === 'Assigned' ? 'success' :
                          resource.status === 'Not Assigned' ? 'warning' :
                          resource.status === 'In Maintenance' ? 'info' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton onClick={() => handleView(resource)} color="info">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {!isAdmin && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => {
                                setSelectedResource(resource);
                                setView('edit');
                              }}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => setDeleteDialog({ open: true, resource })}
                              size="small"
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredResources.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, resource: null })}>
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {deleteDialog.resource?.assetName}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, resource: null })}>Cancel</Button>
          <Button onClick={handleDeleteResource} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssetManagement;
