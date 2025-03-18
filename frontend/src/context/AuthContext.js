import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Set default axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user data from localStorage
          const userData = JSON.parse(localStorage.getItem('user'));
          if (!userData || !userData.email || !userData.email.endsWith('@ddu.edu.et')) {
            throw new Error('Invalid user data');
          }

          // Set initial user state
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid session
        logout();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Validate DDU email
      if (!email.toLowerCase().endsWith('@ddu.edu.et')) {
        return {
          success: false,
          message: 'Please use your DDU email address (@ddu.edu.et)'
        };
      }

      // Log the request details (without sensitive data)
      console.log('Login request:', { email: email.toLowerCase() });

      const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email: email.toLowerCase(),
        password
      });

      const { token, data: { user } } = response.data;

      // Validate user data
      if (!user || !user.email || !user.role || !user.department) {
        throw new Error('Invalid user data received');
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser(user);

      console.log('Login successful:', { 
        email: user.email, 
        role: user.role,
        department: user.department 
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        error: error
      });

      let errorMessage = 'An error occurred during login';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Invalid user data received') {
        errorMessage = 'Invalid user data received from server';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const signup = async (userData) => {
    try {
      // Validate DDU email
      if (!userData.email.toLowerCase().endsWith('@ddu.edu.et')) {
        return {
          success: false,
          message: 'Please use your DDU email address (@ddu.edu.et)'
        };
      }

      // Set department based on role
      if (userData.role === 'dduAssetManager') {
        userData.department = 'DDU';
      } else if (userData.role === 'iotAssetManager') {
        userData.department = 'IoT';
      }

      const response = await axios.post('http://localhost:5000/api/v1/auth/signup', {
        ...userData,
        email: userData.email.toLowerCase()
      });

      return {
        success: true,
        message: response.data.message || 'Registration successful! Please wait for admin approval.'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'An error occurred during registration'
      };
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberedEmail');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => {
    // Validate user data before update
    if (!userData || !userData.email || !userData.role || !userData.department) {
      console.error('Invalid user data for update');
      return;
    }

    // Validate DDU email
    if (!userData.email.endsWith('@ddu.edu.et')) {
      console.error('Invalid DDU email address');
      return;
    }

    // Update storage and state
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
