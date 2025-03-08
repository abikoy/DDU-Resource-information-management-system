import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
  const { logout } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Account Pending Approval
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="body1" paragraph>
            Thank you for registering with the DDU Resource Management System.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your account is currently pending approval from an administrator.
            You will be notified once your account has been approved.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Please check back later or contact the system administrator
            if you need immediate assistance.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={logout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default PendingApproval;
