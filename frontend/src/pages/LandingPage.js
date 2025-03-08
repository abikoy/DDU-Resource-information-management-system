import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  AppBar,
  Toolbar
} from '@mui/material';

const LandingPage = () => {
  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DDU RMS
          </Typography>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" component={Link} to="/signup">
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container>
          <Typography variant="h2" component="h1" gutterBottom>
            Dire Dawa University
          </Typography>
          <Typography variant="h4" gutterBottom>
            Resource Management System
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Efficiently manage and track university resources
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            to="/signup"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Resource Tracking
              </Typography>
              <Typography>
                Efficiently track and manage university resources with our comprehensive system.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Asset Management
              </Typography>
              <Typography>
                Manage both tangible and intangible assets with ease and accuracy.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                User Roles
              </Typography>
              <Typography>
                Different access levels for administrators, asset managers, and staff members.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.200', py: 3, mt: 4 }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Dire Dawa University Resource Management System
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
