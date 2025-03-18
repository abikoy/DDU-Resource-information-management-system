import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard';
import PendingApproval from './pages/PendingApproval';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import AssetManagerDashboard from './pages/AssetManagerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import DDUAssetManagerDashboard from './pages/DDUAssetManagerDashboard';
import IoTAssetManagerDashboard from './pages/IoTAssetManagerDashboard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              
              {/* Protected routes */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute roles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ddu-asset-manager"
                element={
                  <PrivateRoute roles={['dduAssetManager']}>
                    <DDUAssetManagerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/iot-asset-manager"
                element={
                  <PrivateRoute roles={['iotAssetManager']}>
                    <IoTAssetManagerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/asset-manager"
                element={
                  <PrivateRoute roles={['assetManager']}>
                    <AssetManagerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <PrivateRoute roles={['staff']}>
                    <StaffDashboard />
                  </PrivateRoute>
                }
              />
              
              {/* Landing page */}
              <Route path="/" element={<LandingPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
