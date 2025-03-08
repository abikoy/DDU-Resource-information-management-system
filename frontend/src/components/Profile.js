import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Tooltip
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/avatarHelper';
import axios from 'axios';

const Profile = ({ open, onClose }) => {
  const { user, updateUser, logout } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    department: user?.department || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form data when dialog opens
      setFormData({
        fullName: user?.fullName || '',
        email: user?.email || '',
        department: user?.department || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setError('');
      setSuccess('');
      setIsEditing(false);
    }
  }, [open, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('Image size should not exceed 10MB');
        return;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Only .jpg, .jpeg, and .png files are allowed');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate passwords if trying to change password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
      }

      const formPayload = new FormData();
      formPayload.append('fullName', formData.fullName);
      formPayload.append('department', formData.department);
      if (formData.currentPassword) formPayload.append('currentPassword', formData.currentPassword);
      if (formData.newPassword) formPayload.append('newPassword', formData.newPassword);
      if (avatarFile) formPayload.append('avatar', avatarFile);

      const response = await axios.patch('http://localhost:5000/api/v1/users/profile', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update local user data
      const avatarUrl = response.data.data.user.avatar 
        ? `http://localhost:5000${response.data.data.user.avatar}`
        : null;

      updateUser({
        ...user,
        fullName: formData.fullName,
        department: formData.department,
        avatar: avatarUrl
      });

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="profile-dialog-title"
    >
      <DialogTitle id="profile-dialog-title">
        <Box display="flex" alignItems="center" gap={2}>
          <Box position="relative">
            <Tooltip title={isEditing ? "Click to change avatar" : ""}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main', 
                  width: 80, 
                  height: 80,
                  cursor: isEditing ? 'pointer' : 'default'
                }}
                src={getAvatarUrl(user, avatarPreview, true)}
                onClick={handleAvatarClick}
              >
                {user?.fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleAvatarChange}
            />
            {isEditing && (
              <IconButton
                color="primary"
                aria-label="change profile picture"
                sx={{
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  bgcolor: 'background.paper'
                }}
                onClick={handleAvatarClick}
              >
                <PhotoCamera />
              </IconButton>
            )}
          </Box>
          <Typography variant="h6">Profile Settings</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={!isEditing}
            inputProps={{ 'aria-label': 'full name' }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            disabled
            inputProps={{ 'aria-label': 'email' }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled={!isEditing}
            inputProps={{ 'aria-label': 'department' }}
          />

          {isEditing && (
            <>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Change Password
              </Typography>

              <TextField
                margin="normal"
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'current password' }}
              />

              <TextField
                margin="normal"
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'new password' }}
              />

              <TextField
                margin="normal"
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'confirm new password' }}
              />
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={handleLogout} 
          color="error"
          aria-label="logout"
        >
          Logout
        </Button>
        {!isEditing ? (
          <Button 
            onClick={handleEdit} 
            variant="contained"
            aria-label="edit profile"
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button 
              onClick={() => {
                setIsEditing(false);
                setError('');
                setSuccess('');
              }}
              aria-label="cancel changes"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
              aria-label="save changes"
            >
              Save Changes
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Profile;
