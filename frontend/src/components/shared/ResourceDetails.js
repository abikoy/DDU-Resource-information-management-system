import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ResourceDetails = () => {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/resources/${id}`);
        setResource(response.data.data.resource);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching resource details');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!resource) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="info">Resource not found</Alert>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Resource Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Asset Name</TableCell>
                    <TableCell>{resource.assetName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Serial Number</TableCell>
                    <TableCell>{resource.serialNumber || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Department</TableCell>
                    <TableCell>{resource.department}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Asset Type</TableCell>
                    <TableCell>{resource.assetType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Asset Class</TableCell>
                    <TableCell>{resource.assetClass}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Asset Model</TableCell>
                    <TableCell>{resource.assetModel || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell>{resource.location}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell>{resource.status}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Price Information</Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell>{resource.quantity}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                    <TableCell>{resource.unitPrice.birr}.{resource.unitPrice.cents} Birr</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Total Price</TableCell>
                    <TableCell>{resource.totalPrice.birr}.{resource.totalPrice.cents} Birr</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Registry Information</Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Expenditure Registry No.</TableCell>
                    <TableCell>{resource.registryInfo?.expenditureRegistryNo || 'N/A'}</TableCell>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Incoming Goods Registry No.</TableCell>
                    <TableCell>{resource.registryInfo?.incomingGoodsRegistryNo || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Stock Classification</TableCell>
                    <TableCell>{resource.registryInfo?.stockClassification || 'N/A'}</TableCell>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Store No.</TableCell>
                    <TableCell>{resource.registryInfo?.storeNo || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Shelf No.</TableCell>
                    <TableCell>{resource.registryInfo?.shelfNo || 'N/A'}</TableCell>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Order No.</TableCell>
                    <TableCell>{resource.registryInfo?.orderNo || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Outgoing Goods Registry No.</TableCell>
                    <TableCell>{resource.registryInfo?.outgoingGoodsRegistryNo || 'N/A'}</TableCell>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell>{formatDate(resource.registryInfo?.date)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Signatures</Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Store Keeper Name</TableCell>
                    <TableCell>{resource.registryInfo?.storeKeeperName || 'N/A'}</TableCell>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Store Keeper Sign Date</TableCell>
                    <TableCell>{formatDate(resource.registryInfo?.storeKeeperSignDate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Recipient Name</TableCell>
                    <TableCell>{resource.registryInfo?.recipientName || 'N/A'}</TableCell>
                    <TableCell component="th" sx={{ fontWeight: 'bold' }}>Recipient Sign Date</TableCell>
                    <TableCell>{formatDate(resource.registryInfo?.recipientSignDate)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" color="textSecondary">
              Last Updated: {formatDate(resource.updatedAt)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ResourceDetails;
