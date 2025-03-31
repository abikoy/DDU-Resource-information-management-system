import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const ResourceRegistrationForm = ({ onSubmit, onBack, initialData = null, department = '' }) => {
  const [formData, setFormData] = useState({
    assetName: '',
    serialNumber: '',
    assetType: '',
    assetClass: '',
    assetModel: '',
    status: 'Not Assigned',
    location: '',
    quantity: '',
    unitPrice: {
      birr: '',
      cents: ''
    },
    registryInfo: {
      expenditureRegistryNo: '',
      incomingGoodsRegistryNo: '',
      stockClassification: '',
      storeNo: '',
      shelfNo: '',
      outgoingGoodsRegistryNo: '',
      orderNo: '',
      storeKeeperName: '',
      recipientName: ''
    }
  });

  const [errors, setErrors] = useState({});

  const assetTypes = [
    'Consumable',
    'Non-Consumable'
  ];

  const getAssetClasses = () => {
    if (!formData.assetType) return [];

    if (formData.assetType === 'Consumable') {
      return [
        'Office Supplies',
        'Lab Supplies',
        'Cleaning Supplies',
        'Medical Supplies',
        'IT Supplies'
      ];
    } else {
      return [
        'Technology',
        'Furniture',
        'Laboratory Equipment',
        'Library Resources',
        'Facilities and Infrastructure'
      ];
    }
  };

  const calculateTotalPrice = (quantity, unitPrice) => {
    const birr = Number(unitPrice?.birr || 0);
    const cents = Number(unitPrice?.cents || 0);
    const totalCents = (birr * 100 + cents) * quantity;
    return {
      birr: Math.floor(totalCents / 100),
      cents: totalCents % 100
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = {
      assetName: 'Asset name',
      assetType: 'Asset type',
      assetClass: 'Asset class',
      location: 'Location',
      quantity: 'Quantity',
      'unitPrice.birr': 'Unit price (Birr)',
      'unitPrice.cents': 'Unit price (Cents)'
    };

    const errors = {};
    Object.entries(requiredFields).forEach(([field, label]) => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], formData)
        : formData[field];
      
      if (!value && value !== 0) {
        errors[field] = `${label} is required`;
      }
    });

    // Validate numbers
    if (formData.quantity && Number(formData.quantity) < 1) {
      errors.quantity = 'Quantity must be greater than 0';
    }

    if (formData.unitPrice) {
      const { birr, cents } = formData.unitPrice;
      if (Number(birr) < 0) {
        errors['unitPrice.birr'] = 'Price cannot be negative';
      }
      if (Number(cents) < 0 || Number(cents) > 99) {
        errors['unitPrice.cents'] = 'Cents must be between 0 and 99';
      }
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      const quantity = Number(formData.quantity);
      const unitPrice = {
        birr: Number(formData.unitPrice?.birr || 0),
        cents: Number(formData.unitPrice?.cents || 0)
      };

      // Calculate total price
      const totalPrice = calculateTotalPrice(quantity, unitPrice);

      // Format the data
      const formattedData = {
        ...formData,
        department: department,
        status: formData.status || 'Not Assigned',
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        registryInfo: {
          ...formData.registryInfo,
          date: new Date(),
          storeKeeperSignDate: new Date(),
          recipientSignDate: new Date()
        }
      };

      // Log the data being sent
      console.log('Submitting resource data:', formattedData);

      // Submit the form
      await onSubmit(formattedData);

      // Clear form after successful submission
      setFormData({
        assetName: '',
        serialNumber: '',
        assetType: '',
        assetClass: '',
        assetModel: '',
        status: 'Not Assigned',
        location: '',
        quantity: '',
        unitPrice: { birr: '', cents: '' },
        registryInfo: {
          expenditureRegistryNo: '',
          incomingGoodsRegistryNo: '',
          stockClassification: '',
          storeNo: '',
          shelfNo: '',
          outgoingGoodsRegistryNo: '',
          orderNo: '',
          storeKeeperName: '',
          recipientName: ''
        }
      });
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error.response?.data?.message || 'Error submitting form';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors) {
        setErrors(prev => ({
          ...prev,
          submit: `${errorMessage}: ${validationErrors.join(', ')}`
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          submit: errorMessage
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for cents to ensure it stays between 0 and 99
    if (name === 'unitPrice.cents') {
      const cents = parseInt(value);
      if (isNaN(cents)) {
        // If not a number, set to empty string
        setFormData(prev => ({
          ...prev,
          unitPrice: {
            ...prev.unitPrice,
            cents: ''
          }
        }));
      } else {
        // Constrain cents between 0 and 99
        const validCents = Math.max(0, Math.min(99, cents));
        setFormData(prev => ({
          ...prev,
          unitPrice: {
            ...prev.unitPrice,
            cents: validCents.toString()
          }
        }));
      }
      return;
    }

    // Handle other fields normally
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Add New Asset</Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Asset Name *"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
              error={!!errors.assetName}
              helperText={errors.assetName}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Serial Number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              error={!!errors.serialNumber}
              helperText={errors.serialNumber}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Asset Type *</InputLabel>
              <Select
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                label="Asset Type *"
                error={!!errors.assetType}
                helperText={errors.assetType}
              >
                {assetTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Asset Class *</InputLabel>
              <Select
                name="assetClass"
                value={formData.assetClass}
                onChange={handleChange}
                label="Asset Class *"
                error={!!errors.assetClass}
                helperText={errors.assetClass}
                disabled={!formData.assetType}
              >
                {getAssetClasses().map(cls => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Asset Model"
              name="assetModel"
              value={formData.assetModel}
              onChange={handleChange}
              error={!!errors.assetModel}
              helperText={errors.assetModel}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="Not Assigned">Not Assigned</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="In Maintenance">In Maintenance</MenuItem>
                <MenuItem value="Retired">Retired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location *"
              name="location"
              value={formData.location}
              onChange={handleChange}
              error={!!errors.location}
              helperText={errors.location}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Quantity *"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Price Information</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Price (Birr)</TableCell>
                <TableCell>Unit Price (Cents)</TableCell>
                <TableCell>Total Price (Birr)</TableCell>
                <TableCell>Total Price (Cents)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{formData.assetName}</TableCell>
                <TableCell>{formData.quantity}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    name="unitPrice.birr"
                    type="number"
                    value={formData.unitPrice.birr}
                    onChange={handleChange}
                    error={!!errors['unitPrice.birr']}
                    helperText={errors['unitPrice.birr']}
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    label="Unit Price (Cents)"
                    name="unitPrice.cents"
                    type="number"
                    value={formData.unitPrice.cents}
                    onChange={handleChange}
                    error={!!errors['unitPrice.cents']}
                    helperText={errors['unitPrice.cents']}
                    inputProps={{
                      min: 0,
                      max: 99,
                      onKeyDown: (e) => {
                        // Prevent typing of invalid numbers
                        if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                          const newValue = e.target.value + e.key;
                          if (!/^\d*$/.test(e.key) || parseInt(newValue) > 99) {
                            e.preventDefault();
                          }
                        }
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{calculateTotalPrice(Number(formData.quantity), { birr: Number(formData.unitPrice.birr), cents: Number(formData.unitPrice.cents) }).birr}</TableCell>
                <TableCell>{calculateTotalPrice(Number(formData.quantity), { birr: Number(formData.unitPrice.birr), cents: Number(formData.unitPrice.cents) }).cents}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} align="right">Total:</TableCell>
                <TableCell colSpan={2}>{calculateTotalPrice(Number(formData.quantity), { birr: Number(formData.unitPrice.birr), cents: Number(formData.unitPrice.cents) }).birr}.{calculateTotalPrice(Number(formData.quantity), { birr: Number(formData.unitPrice.birr), cents: Number(formData.unitPrice.cents) }).cents} Birr</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Registry Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Expenditure Registry No."
              name="registryInfo.expenditureRegistryNo"
              value={formData.registryInfo.expenditureRegistryNo}
              onChange={handleChange}
              error={!!errors.expenditureRegistryNo}
              helperText={errors.expenditureRegistryNo}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Incoming Goods Registry No."
              name="registryInfo.incomingGoodsRegistryNo"
              value={formData.registryInfo.incomingGoodsRegistryNo}
              onChange={handleChange}
              error={!!errors.incomingGoodsRegistryNo}
              helperText={errors.incomingGoodsRegistryNo}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Stock Classification"
              name="registryInfo.stockClassification"
              value={formData.registryInfo.stockClassification}
              onChange={handleChange}
              error={!!errors.stockClassification}
              helperText={errors.stockClassification}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Store No."
              name="registryInfo.storeNo"
              value={formData.registryInfo.storeNo}
              onChange={handleChange}
              error={!!errors.storeNo}
              helperText={errors.storeNo}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Shelf No."
              name="registryInfo.shelfNo"
              value={formData.registryInfo.shelfNo}
              onChange={handleChange}
              error={!!errors.shelfNo}
              helperText={errors.shelfNo}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Outgoing Goods Registry No."
              name="registryInfo.outgoingGoodsRegistryNo"
              value={formData.registryInfo.outgoingGoodsRegistryNo}
              onChange={handleChange}
              error={!!errors.outgoingGoodsRegistryNo}
              helperText={errors.outgoingGoodsRegistryNo}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Order No."
              name="registryInfo.orderNo"
              value={formData.registryInfo.orderNo}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              name="registryInfo.date"
              value={formData.registryInfo.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>Signatures</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Store Keeper Name"
              name="registryInfo.storeKeeperName"
              value={formData.registryInfo.storeKeeperName}
              onChange={handleChange}
              error={!!errors.storeKeeperName}
              helperText={errors.storeKeeperName}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Store Keeper Sign Date"
              name="registryInfo.storeKeeperSignDate"
              value={formData.registryInfo.storeKeeperSignDate}
              onChange={handleChange}
              error={!!errors.storeKeeperSignDate}
              helperText={errors.storeKeeperSignDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Recipient Name"
              name="registryInfo.recipientName"
              value={formData.registryInfo.recipientName}
              onChange={handleChange}
              error={!!errors.recipientName}
              helperText={errors.recipientName}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Recipient Sign Date"
              name="registryInfo.recipientSignDate"
              value={formData.registryInfo.recipientSignDate}
              onChange={handleChange}
              error={!!errors.recipientSignDate}
              helperText={errors.recipientSignDate}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onBack}>
            CANCEL
          </Button>
          <Button type="submit" variant="contained" color="primary">
            SAVE ASSET
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ResourceRegistrationForm;