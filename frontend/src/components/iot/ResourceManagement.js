import React from 'react';
import AssetManagement from '../shared/AssetManagement';
import { Box } from '@mui/material';

const ResourceManagement = () => {
  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <AssetManagement department="IoT" />
    </Box>
  );
};

export default ResourceManagement;
