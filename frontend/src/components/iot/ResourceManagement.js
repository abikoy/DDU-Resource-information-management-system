import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import ResourceRegistrationForm from '../shared/ResourceRegistrationForm';
import axios from 'axios';

const ResourceManagement = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/v1/resources/iot', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.status === 'success') {
        setResources(response.data.data.resources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      showError('Failed to fetch resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const showSuccess = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const showError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleResourceRegistration = async (formData) => {
    try {
      setLoading(true);

      // Transform items to match backend requirements
      const transformedItems = formData.items.map(item => {
        // Calculate prices
        const quantity = parseFloat(item.quantity) || 0;
        const unitPriceBirr = parseFloat(item.unitPriceBirr) || 0;
        const unitPriceCents = parseFloat(item.unitPriceCents || '0') || 0;

        return {
          description: item.description,
          model: item.model || '',
          serial: item.serial || '',
          fromNo: item.fromNo || '',
          toNo: item.toNo || '',
          quantity: quantity,
          unitPriceBirr: unitPriceBirr,
          unitPriceCents: unitPriceCents,
          remarks: item.remarks || '',
          resourceType: item.resourceType || 'it_resources' // Default for IoT
        };
      });

      const payload = {
        department: 'IoT',
        expenditureRegistryNo: formData.expenditureRegistryNo,
        incomingGoodsRegistryNo: formData.incomingGoodsRegistryNo,
        stockClassification: formData.stockClassification,
        storeNo: formData.storeNo,
        shelfNo: formData.shelfNo,
        outgoingGoodsRegistryNo: formData.outgoingGoodsRegistryNo,
        orderNo: formData.orderNo,
        dateOf: formData.dateOf,
        items: transformedItems
      };

      const response = await axios.post('http://localhost:5000/api/v1/resources', 
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.status === 'success') {
        showSuccess('Resources registered successfully');
        fetchResources();
        setCurrentTab(1); // Switch to View Resources tab
      }
    } catch (error) {
      console.error('Error registering resource:', error);
      showError(error.response?.data?.message || 'Error registering resource');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 Birr';
    return `${price} Birr`;
  };

  const getResourceTypeLabel = (type) => {
    const labels = {
      room_furniture: 'Room Furniture',
      equipment: 'Equipment',
      software: 'Software',
      office_supplies: 'Office Supplies',
      it_resources: 'IT Resources'
    };
    return labels[type] || type;
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Register New Resource" />
          <Tab label="View Resources" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : currentTab === 0 ? (
            <ResourceRegistrationForm 
              department="IoT"
              onSubmit={handleResourceRegistration}
            />
          ) : (
            <Grid container spacing={3}>
              {resources.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No resources found
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                resources.map((resource) => (
                  <Grid item xs={12} key={resource._id}>
                    <Paper sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="h6">{resource.description}</Typography>
                          <Typography color="textSecondary" gutterBottom>
                            Type: {getResourceTypeLabel(resource.resourceType)}
                          </Typography>
                          <Typography>Model: {resource.model || 'N/A'}</Typography>
                          <Typography>Serial: {resource.serial || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography>Status: {resource.status}</Typography>
                          <Typography>Quantity: {resource.quantity}</Typography>
                          <Typography>Unit Price: {formatPrice(resource.unitPrice)}</Typography>
                          <Typography>Total Price: {formatPrice(resource.totalPrice)}</Typography>
                          {resource.remarks && (
                            <Typography>Remarks: {resource.remarks}</Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Box>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResourceManagement;
