import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  styled,
  FormHelperText,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: '1px solid rgba(224, 224, 224, 1)',
  borderRight: '1px solid rgba(224, 224, 224, 1)',
  padding: '8px',
  '&:last-child': {
    borderRight: 'none'
  }
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    padding: '8px',
  },
});

const ResourceRegistrationForm = ({ department, onSubmit }) => {
  const [registryInfo, setRegistryInfo] = useState({
    expenditureRegistryNo: '',
    incomingGoodsRegistryNo: '',
    stockClassification: '',
    storeNo: '',
    shelfNo: '',
    outgoingGoodsRegistryNo: '',
    orderNo: '',
    dateOf: new Date().toISOString().split('T')[0]
  });

  const [items, setItems] = useState([{
    id: 1,
    description: '',
    model: '',
    serial: '',
    fromNo: '',
    toNo: '',
    quantity: '',
    unitPriceBirr: '',
    unitPriceCents: '',
    totalPriceBirr: '',
    totalPriceCents: '',
    remarks: '',
    resourceType: ''
  }]);

  const resourceTypes = [
    { value: 'room_furniture', label: 'Room Furniture' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'software', label: 'Software' },
    { value: 'office_supplies', label: 'Office Supplies' },
    { value: 'it_resources', label: 'IT Resources' }
  ];

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    if (!value || value.trim() === '') {
      return 'This field is required';
    }
    return '';
  };

  const validateNumber = (value, min = 0, max = null) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Please enter a valid number';
    }
    if (num < min) {
      return `Value must be at least ${min}`;
    }
    if (max !== null && num > max) {
      return `Value must be less than ${max}`;
    }
    return '';
  };

  const handleRegistryChange = (field) => (event) => {
    const value = event.target.value;
    setRegistryInfo({
      ...registryInfo,
      [field]: value
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleItemChange = (index, field) => (event) => {
    const value = event.target.value;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Calculate total price if unit price or quantity changes
    if (field === 'unitPriceBirr' || field === 'unitPriceCents' || field === 'quantity') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitBirr = parseFloat(newItems[index].unitPriceBirr) || 0;
      const unitCents = parseFloat(newItems[index].unitPriceCents || '0') || 0;
      
      const totalInCents = Math.round((unitBirr * 100 + unitCents) * quantity);
      newItems[index].totalPriceBirr = Math.floor(totalInCents / 100).toString();
      newItems[index].totalPriceCents = (totalInCents % 100).toString().padStart(2, '0');
    }

    setItems(newItems);
    setErrors({}); // Clear errors when user makes changes
  };

  const addNewRow = () => {
    setItems([...items, {
      id: items.length + 1,
      description: '',
      model: '',
      serial: '',
      fromNo: '',
      toNo: '',
      quantity: '',
      unitPriceBirr: '',
      unitPriceCents: '',
      totalPriceBirr: '',
      totalPriceCents: '',
      remarks: '',
      resourceType: ''
    }]);
  };

  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalPriceBirr = 0;
    let totalPriceCents = 0;

    items.forEach(item => {
      totalQuantity += parseFloat(item.quantity) || 0;
      totalPriceBirr += parseFloat(item.totalPriceBirr) || 0;
      totalPriceCents += parseFloat(item.totalPriceCents) || 0;
    });

    // Adjust for cents overflow
    totalPriceBirr += Math.floor(totalPriceCents / 100);
    totalPriceCents = totalPriceCents % 100;

    return {
      quantity: totalQuantity,
      birr: totalPriceBirr,
      cents: totalPriceCents
    };
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate registry info
    Object.keys(registryInfo).forEach(field => {
      if (!registryInfo[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate items
    if (!items || items.length === 0) {
      newErrors.items = 'At least one item is required';
      return newErrors;
    }

    items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`items.${index}.description`] = 'Description is required';
      }
      if (!item.resourceType || !resourceTypes.find(rt => rt.value === item.resourceType)) {
        newErrors[`items.${index}.resourceType`] = 'Please select a valid resource type';
      }
      if (!item.quantity || isNaN(item.quantity) || parseFloat(item.quantity) <= 0) {
        newErrors[`items.${index}.quantity`] = 'Please enter a valid quantity (greater than 0)';
      }
      if (!item.unitPriceBirr || isNaN(item.unitPriceBirr) || parseFloat(item.unitPriceBirr) < 0) {
        newErrors[`items.${index}.unitPriceBirr`] = 'Please enter a valid price (0 or greater)';
      }
      if (item.unitPriceCents && (isNaN(item.unitPriceCents) || parseFloat(item.unitPriceCents) < 0 || parseFloat(item.unitPriceCents) > 99)) {
        newErrors[`items.${index}.unitPriceCents`] = 'Cents must be between 0 and 99';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Transform the data to match the backend requirements
    const transformedData = {
      ...registryInfo,
      items: items.map(item => ({
        description: item.description,
        model: item.model || '',
        serial: item.serial || '',
        fromNo: item.fromNo || '',
        toNo: item.toNo || '',
        quantity: parseFloat(item.quantity),
        unitPriceBirr: parseFloat(item.unitPriceBirr || '0'),
        unitPriceCents: parseFloat(item.unitPriceCents || '0'),
        remarks: item.remarks || '',
        resourceType: item.resourceType
      }))
    };

    onSubmit(transformedData);
  };

  const totals = calculateTotals();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ textDecoration: 'underline' }}>
        RECEIPT FOR ARTICLES OF PROPERTY ISSUED
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StyledTextField
            fullWidth
            label="1. Item No. in Expenditure Registry"
            value={registryInfo.expenditureRegistryNo}
            onChange={handleRegistryChange('expenditureRegistryNo')}
            error={!!errors.expenditureRegistryNo}
            helperText={errors.expenditureRegistryNo}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StyledTextField
            fullWidth
            label="2. No. of Entry in Register of Incoming Goods"
            value={registryInfo.incomingGoodsRegistryNo}
            onChange={handleRegistryChange('incomingGoodsRegistryNo')}
            error={!!errors.incomingGoodsRegistryNo}
            helperText={errors.incomingGoodsRegistryNo}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StyledTextField
            fullWidth
            label="3. Classification of Stock"
            value={registryInfo.stockClassification}
            onChange={handleRegistryChange('stockClassification')}
            error={!!errors.stockClassification}
            helperText={errors.stockClassification}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StyledTextField
            fullWidth
            label="4. Store No."
            value={registryInfo.storeNo}
            onChange={handleRegistryChange('storeNo')}
            error={!!errors.storeNo}
            helperText={errors.storeNo}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StyledTextField
            fullWidth
            label="5. Shelf No."
            value={registryInfo.shelfNo}
            onChange={handleRegistryChange('shelfNo')}
            error={!!errors.shelfNo}
            helperText={errors.shelfNo}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StyledTextField
            fullWidth
            label="6. No. of Entry in Register of Outgoing Goods"
            value={registryInfo.outgoingGoodsRegistryNo}
            onChange={handleRegistryChange('outgoingGoodsRegistryNo')}
            error={!!errors.outgoingGoodsRegistryNo}
            helperText={errors.outgoingGoodsRegistryNo}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Order No."
            value={registryInfo.orderNo}
            onChange={handleRegistryChange('orderNo')}
            error={!!errors.orderNo}
            helperText={errors.orderNo}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            type="date"
            label="Date"
            value={registryInfo.dateOf}
            onChange={handleRegistryChange('dateOf')}
            error={!!errors.dateOf}
            helperText={errors.dateOf}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>No.</StyledTableCell>
              <StyledTableCell>Description of Articles or Property</StyledTableCell>
              <StyledTableCell>Resource Type</StyledTableCell>
              <StyledTableCell>Model</StyledTableCell>
              <StyledTableCell>Serial</StyledTableCell>
              <StyledTableCell>From</StyledTableCell>
              <StyledTableCell>To</StyledTableCell>
              <StyledTableCell>Quantity</StyledTableCell>
              <StyledTableCell>Unit Price (Birr)</StyledTableCell>
              <StyledTableCell>Cents</StyledTableCell>
              <StyledTableCell>Total Price (Birr)</StyledTableCell>
              <StyledTableCell>Cents</StyledTableCell>
              <StyledTableCell>Remarks</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description')(e)}
                    error={!!errors[`items.${index}.description`]}
                    helperText={errors[`items.${index}.description`]}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <FormControl fullWidth>
                    <Select
                      value={item.resourceType}
                      onChange={(e) => handleItemChange(index, 'resourceType')(e)}
                      displayEmpty
                      error={!!errors[`items.${index}.resourceType`]}
                    >
                      <MenuItem value="" disabled>Select Type</MenuItem>
                      {resourceTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors[`items.${index}.resourceType`] && (
                      <FormHelperText error>
                        {errors[`items.${index}.resourceType`]}
                      </FormHelperText>
                    )}
                  </FormControl>
                </StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    value={item.model}
                    onChange={(e) => handleItemChange(index, 'model')(e)}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    value={item.serial}
                    onChange={(e) => handleItemChange(index, 'serial')(e)}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    value={item.fromNo}
                    onChange={(e) => handleItemChange(index, 'fromNo')(e)}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    value={item.toNo}
                    onChange={(e) => handleItemChange(index, 'toNo')(e)}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity')(e)}
                    error={!!errors[`items.${index}.quantity`]}
                    helperText={errors[`items.${index}.quantity`]}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    type="number"
                    value={item.unitPriceBirr}
                    onChange={(e) => handleItemChange(index, 'unitPriceBirr')(e)}
                    error={!!errors[`items.${index}.unitPriceBirr`]}
                    helperText={errors[`items.${index}.unitPriceBirr`]}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    type="number"
                    value={item.unitPriceCents}
                    onChange={(e) => handleItemChange(index, 'unitPriceCents')(e)}
                    error={!!errors[`items.${index}.unitPriceCents`]}
                    helperText={errors[`items.${index}.unitPriceCents`]}
                  />
                </StyledTableCell>
                <StyledTableCell>
                  <Typography>{item.totalPriceBirr}</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography>{item.totalPriceCents}</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <StyledTextField
                    fullWidth
                    value={item.remarks}
                    onChange={(e) => handleItemChange(index, 'remarks')(e)}
                  />
                </StyledTableCell>
              </TableRow>
            ))}
            <TableRow>
              <StyledTableCell colSpan={6} align="right">Total:</StyledTableCell>
              <StyledTableCell>{totals.quantity}</StyledTableCell>
              <StyledTableCell colSpan={2}></StyledTableCell>
              <StyledTableCell>{totals.birr}</StyledTableCell>
              <StyledTableCell>{totals.cents}</StyledTableCell>
              <StyledTableCell></StyledTableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" color="primary" onClick={addNewRow}>
          Add New Row
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>Store Keeper's Signature: _________________</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>Recipient's Signature: _________________</Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ResourceRegistrationForm;
