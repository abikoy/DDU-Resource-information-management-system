import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Menu,
  MenuItem,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import ResourceRegistrationForm from './ResourceRegistrationForm';
import axios from 'axios';

const AssetManagement = ({ department }) => {
  const [view, setView] = useState('main');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchResources();
  }, [department]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/v1/resources`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Filter resources based on department
      const departmentResources = response.data.data.resources.filter(
        resource => resource.department === department
      );

      setResources(departmentResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching resources',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = () => {
    setView('add');
  };

  const handleResourceSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Convert numeric strings to numbers and ensure all required fields
      const transformedData = {
        department, // Make sure department is included
        assetName: formData.assetName,
        serialNumber: formData.serialNumber || '',
        assetClass: formData.assetClass,
        assetType: formData.assetType,
        assetModel: formData.assetModel || '',
        quantity: parseInt(formData.quantity, 10),
        unitPrice: {
          birr: parseInt(formData.unitPrice.birr, 10) || 0,
          cents: parseInt(formData.unitPrice.cents, 10) || 0
        },
        totalPrice: {
          birr: parseInt(formData.totalPrice.birr, 10) || 0,
          cents: parseInt(formData.totalPrice.cents, 10) || 0
        },
        location: formData.location || 'In Office',
        remarks: formData.remarks || '',
        registryInfo: {
          expenditureRegistryNo: formData.registryInfo.expenditureRegistryNo,
          incomingGoodsRegistryNo: formData.registryInfo.incomingGoodsRegistryNo,
          stockClassification: formData.registryInfo.stockClassification,
          storeNo: formData.registryInfo.storeNo,
          shelfNo: formData.registryInfo.shelfNo,
          outgoingGoodsRegistryNo: formData.registryInfo.outgoingGoodsRegistryNo,
          orderNo: formData.registryInfo.orderNo,
          dateOf: new Date(formData.registryInfo.dateOf).toISOString(),
          storeKeeperSignature: {
            name: formData.registryInfo.storeKeeperSignature.name,
            date: new Date(formData.registryInfo.storeKeeperSignature.date).toISOString()
          },
          recipientSignature: {
            name: formData.registryInfo.recipientSignature.name,
            date: new Date(formData.registryInfo.recipientSignature.date).toISOString()
          }
        }
      };

      console.log('Sending resource data:', transformedData);

      const response = await axios.post(
        'http://localhost:5000/api/v1/resources',
        transformedData, // Send transformed data directly, department is already included
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.status === 'success') {
        // Show success message
        setSnackbar({
          open: true,
          message: 'Asset registered successfully',
          severity: 'success'
        });
        
        // Refresh the resource list and return to main view
        await fetchResources();
        setView('main');
      }
    } catch (error) {
      console.error('Error registering resource:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || 
                         (error.response?.data?.errors && error.response.data.errors.join(', ')) ||
                         'Error registering asset';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterClick = (event) => {
    setFilterAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchor(null);
  };

  const handleSortClick = (event) => {
    setSortAnchor(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchor(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'primary';
      case 'deployable':
        return 'success';
      case 'damaged':
        return 'error';
        case 'not assigned':
          return 'warning';
      default:
        return 'default';
    }
  };

  const filteredResources = resources
    .filter(resource => {
      const matchesSearch = searchTerm ? (
        (resource.assetName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.assetModel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (resource.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;
      
      const matchesStatus = selectedStatus === 'all' || resource.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.assetName || '').localeCompare(b.assetName || '');
        case 'dateAdded':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

  if (view === 'add') {
    return (
      <Box>
        <Button
          variant="outlined"
          onClick={() => setView('main')}
          sx={{ mb: 2 }}
        >
          Back to Assets
        </Button>
        <ResourceRegistrationForm
          department={department}
          onSubmit={handleResourceSubmit}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="h5" component="h1">
              Hardware Assets
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddResource}
            >
              Add a new item to your Asset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search assets..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Filter">
              <IconButton onClick={handleFilterClick}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort">
              <IconButton onClick={handleSortClick}>
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset Tag</TableCell>
                <TableCell>Asset Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Asset Class</TableCell>
                <TableCell>Asset Model</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResources.map((resource, index) => (
                <TableRow key={resource._id}>
                  <TableCell>{resource.assetTag}</TableCell>
                  <TableCell>{resource.assetName}</TableCell>
                  <TableCell>{resource.serialNumber || '-'}</TableCell>
                  <TableCell>{resource.assetClass}</TableCell>
                  <TableCell>{resource.assetModel || '-'}</TableCell>
                  <TableCell>{resource.assignedTo?.fullName || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={resource.status}
                      color={getStatusColor(resource.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{resource.location || 'In Office'}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => { setSelectedStatus('all'); handleFilterClose(); }}>
          All Status
        </MenuItem>
        <MenuItem onClick={() => { setSelectedStatus('deployable'); handleFilterClose(); }}>
          Deployable
        </MenuItem>
        <MenuItem onClick={() => { setSelectedStatus('assigned'); handleFilterClose(); }}>
          Assigned
        </MenuItem>
        <MenuItem onClick={() => { setSelectedStatus('not assigned'); handleFilterClose(); }}>
          Not Assigned
        </MenuItem>
        <MenuItem onClick={() => { setSelectedStatus('damaged'); handleFilterClose(); }}>
          Damaged
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={sortAnchor}
        open={Boolean(sortAnchor)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={() => { setSortBy('name'); handleSortClose(); }}>
          Sort by Name
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('dateAdded'); handleSortClose(); }}>
          Sort by Date Added
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('status'); handleSortClose(); }}>
          Sort by Status
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default AssetManagement;
