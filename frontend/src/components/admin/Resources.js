import React from 'react';
import { Box, Typography } from '@mui/material';
import AssetManagement from '../shared/AssetManagement';

const Resources = () => {
  return (
    <Box>
      <AssetManagement isAdmin={true} />
    </Box>
  );
};

export default Resources;
