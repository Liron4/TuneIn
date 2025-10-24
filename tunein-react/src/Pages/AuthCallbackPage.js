// src/Pages/AuthCallbackPage.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Components/AuthPage/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function AuthCallbackPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');

    if (token && userId) {

      login(token, userId);

      navigate('/home', { replace: true });
    } else {
  
      navigate('/auth?error=callback_failed', { replace: true });
    }
  }, [login, location.search, navigate]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
      <Typography ml={2}>Logging you in...</Typography>
    </Box>
  );
}
