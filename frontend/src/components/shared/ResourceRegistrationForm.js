import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';

const ResourceRegistrationForm = ({ department, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    assetName: '',
    serialNumber: '',
    assetClass: '',
    assetType: '',
    assetModel: '',
    quantity: '1',
    unitPrice: {
      birr: '',
      cents: '00'
    },
    totalPrice: {
      birr: '0',
      cents: '00'
    },
    location: 'In Office',
    remarks: '',
    registryInfo: {
      expenditureRegistryNo: '',
      incomingGoodsRegistryNo: '',
      stockClassification: '',
      storeNo: '',
      shelfNo: '',
      outgoingGoodsRegistryNo: '',
      orderNo: '',
      dateOf: new Date().toISOString().split('T')[0],
      storeKeeperSignature: {
        name: '',
        date: new Date().toISOString().split('T')[0]
      },
      recipientSignature: {
        name: '',
        date: new Date().toISOString().split('T')[0]
      }
    }
  });

  const [errors, setErrors] = useState({});

  const assetClasses = [
    { value: 'Furniture', label: 'Furniture' },
    { value: 'IT Resources', label: 'IT Resources' },
    { value: 'Laboratory Equipment', label: 'Laboratory Equipment' },
    { value: 'Office Equipment', label: 'Office Equipment' },
    { value: 'Teaching Materials', label: 'Teaching Materials' },
    { value: 'Library Resources', label: 'Library Resources' },
    { value: 'Sports Equipment', label: 'Sports Equipment' },
    { value: 'Audio/Visual Equipment', label: 'Audio/Visual Equipment' },
    { value: 'Research Equipment', label: 'Research Equipment' },
    { value: 'Software Licenses', label: 'Software Licenses' },
    { value: 'Network Infrastructure', label: 'Network Infrastructure' },
    { value: 'Security Equipment', label: 'Security Equipment' },
    { value: 'Maintenance Tools', label: 'Maintenance Tools' },
    { value: 'Medical Equipment', label: 'Medical Equipment' },
    { value: 'Other Resources', label: 'Other Resources' }
  ];

  const assetTypes = [
    { value: 'Tangible', label: 'Tangible' },
    { value: 'Intangible', label: 'Intangible' }
  ];

  const calculateTotalPrice = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitPriceBirr = parseFloat(formData.unitPrice.birr) || 0;
    const unitPriceCents = parseFloat(formData.unitPrice.cents) || 0;
    
    const totalInCents = Math.round((unitPriceBirr * 100 + unitPriceCents) * quantity);
    const totalBirr = Math.floor(totalInCents / 100);
    const totalCents = totalInCents % 100;

    setFormData(prev => ({
      ...prev,
      totalPrice: {
        birr: totalBirr.toString(),
        cents: totalCents.toString().padStart(2, '0')
      }
    }));
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [formData.quantity, formData.unitPrice.birr, formData.unitPrice.cents]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedChange = (parent, field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    
    if (errors[`${parent}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${parent}.${field}`]: ''
      }));
    }
  };

  const handleRegistryChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      registryInfo: {
        ...prev.registryInfo,
        [field]: event.target.value
      }
    }));
    
    if (errors[`registryInfo.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`registryInfo.${field}`]: ''
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    const newErrors = {};

    // Validate required fields
    if (!formData.assetName) {
      newErrors.assetName = 'Asset name is required';
    }

    if (!formData.assetClass) {
      newErrors.assetClass = 'Asset class is required';
    }

    if (!formData.assetType) {
      newErrors.assetType = 'Asset type is required';
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (!formData.unitPrice.birr || formData.unitPrice.birr < 0) {
      newErrors['unitPrice.birr'] = 'Unit price cannot be negative';
    }

    // Validate registry info
    const requiredRegistryFields = [
      'expenditureRegistryNo',
      'incomingGoodsRegistryNo',
      'stockClassification',
      'storeNo',
      'shelfNo',
      'outgoingGoodsRegistryNo',
      'orderNo',
      'dateOf'
    ];

    requiredRegistryFields.forEach(field => {
      if (!formData.registryInfo[field]) {
        newErrors[`registryInfo.${field}`] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    // Validate signatures
    if (!formData.registryInfo.storeKeeperSignature.name) {
      newErrors['registryInfo.storeKeeperSignature.name'] = 'Store keeper name is required';
    }
    if (!formData.registryInfo.recipientSignature.name) {
      newErrors['registryInfo.recipientSignature.name'] = 'Recipient name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Asset
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Asset Name"
              value={formData.assetName}
              onChange={handleChange('assetName')}
              error={!!errors.assetName}
              helperText={errors.assetName}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Serial Number"
              value={formData.serialNumber}
              onChange={handleChange('serialNumber')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.assetClass} required>
              <InputLabel>Asset Class</InputLabel>
              <Select
                value={formData.assetClass}
                onChange={handleChange('assetClass')}
                label="Asset Class"
              >
                {assetClasses.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.assetClass && (
                <FormHelperText>{errors.assetClass}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.assetType} required>
              <InputLabel>Asset Type</InputLabel>
              <Select
                value={formData.assetType}
                onChange={handleChange('assetType')}
                label="Asset Type"
              >
                {assetTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.assetType && (
                <FormHelperText>{errors.assetType}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Asset Model"
              value={formData.assetModel}
              onChange={handleChange('assetModel')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              error={!!errors.quantity}
              helperText={errors.quantity}
              required
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Price Information
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price (Birr)</TableCell>
                    <TableCell align="right">Unit Price (Cents)</TableCell>
                    <TableCell align="right">Total Price (Birr)</TableCell>
                    <TableCell align="right">Total Price (Cents)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{formData.assetName || '-'}</TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange('quantity')}
                        error={!!errors.quantity}
                        size="small"
                        inputProps={{ min: 1, style: { textAlign: 'right' } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={formData.unitPrice.birr}
                        onChange={handleNestedChange('unitPrice', 'birr')}
                        error={!!errors['unitPrice.birr']}
                        size="small"
                        inputProps={{ min: 0, style: { textAlign: 'right' } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={formData.unitPrice.cents}
                        onChange={handleNestedChange('unitPrice', 'cents')}
                        error={!!errors['unitPrice.cents']}
                        size="small"
                        inputProps={{ min: 0, max: 99, style: { textAlign: 'right' } }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formData.totalPrice.birr}
                    </TableCell>
                    <TableCell align="right">
                      {formData.totalPrice.cents}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Total:</strong>
                    </TableCell>
                    <TableCell align="right" colSpan={3}>
                      <strong>
                        {formData.totalPrice.birr}.{formData.totalPrice.cents} Birr
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Registry Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Expenditure Registry No"
              value={formData.registryInfo.expenditureRegistryNo}
              onChange={handleRegistryChange('expenditureRegistryNo')}
              error={!!errors['registryInfo.expenditureRegistryNo']}
              helperText={errors['registryInfo.expenditureRegistryNo']}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Incoming Goods Registry No"
              value={formData.registryInfo.incomingGoodsRegistryNo}
              onChange={handleRegistryChange('incomingGoodsRegistryNo')}
              error={!!errors['registryInfo.incomingGoodsRegistryNo']}
              helperText={errors['registryInfo.incomingGoodsRegistryNo']}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Stock Classification"
              value={formData.registryInfo.stockClassification}
              onChange={handleRegistryChange('stockClassification')}
              error={!!errors['registryInfo.stockClassification']}
              helperText={errors['registryInfo.stockClassification']}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Store No"
              value={formData.registryInfo.storeNo}
              onChange={handleRegistryChange('storeNo')}
              error={!!errors['registryInfo.storeNo']}
              helperText={errors['registryInfo.storeNo']}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Shelf No"
              value={formData.registryInfo.shelfNo}
              onChange={handleRegistryChange('shelfNo')}
              error={!!errors['registryInfo.shelfNo']}
              helperText={errors['registryInfo.shelfNo']}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Outgoing Goods Registry No"
              value={formData.registryInfo.outgoingGoodsRegistryNo}
              onChange={handleRegistryChange('outgoingGoodsRegistryNo')}
              error={!!errors['registryInfo.outgoingGoodsRegistryNo']}
              helperText={errors['registryInfo.outgoingGoodsRegistryNo']}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Order No"
              value={formData.registryInfo.orderNo}
              onChange={handleRegistryChange('orderNo')}
              error={!!errors['registryInfo.orderNo']}
              helperText={errors['registryInfo.orderNo']}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={formData.registryInfo.dateOf}
              onChange={handleRegistryChange('dateOf')}
              error={!!errors['registryInfo.dateOf']}
              helperText={errors['registryInfo.dateOf']}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Signatures
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Store Keeper Name"
              value={formData.registryInfo.storeKeeperSignature.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                registryInfo: {
                  ...prev.registryInfo,
                  storeKeeperSignature: {
                    ...prev.registryInfo.storeKeeperSignature,
                    name: e.target.value
                  }
                }
              }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Store Keeper Sign Date"
              value={formData.registryInfo.storeKeeperSignature.date}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                registryInfo: {
                  ...prev.registryInfo,
                  storeKeeperSignature: {
                    ...prev.registryInfo.storeKeeperSignature,
                    date: e.target.value
                  }
                }
              }))}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Recipient Name"
              value={formData.registryInfo.recipientSignature.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                registryInfo: {
                  ...prev.registryInfo,
                  recipientSignature: {
                    ...prev.registryInfo.recipientSignature,
                    name: e.target.value
                  }
                }
              }))}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Recipient Sign Date"
              value={formData.registryInfo.recipientSignature.date}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                registryInfo: {
                  ...prev.registryInfo,
                  recipientSignature: {
                    ...prev.registryInfo.recipientSignature,
                    date: e.target.value
                  }
                }
              }))}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Asset'}
        </Button>
      </Box>
    </Box>
  );
};

export default ResourceRegistrationForm;
