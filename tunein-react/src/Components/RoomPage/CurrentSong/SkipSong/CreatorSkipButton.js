import React, { useState } from 'react';
import { Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import axios from 'axios';
import { useSocket } from '../../Context/SocketContext';

const CreatorSkipButton = ({ onSkip }) => {
  const { roomId } = useSocket();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Mobile + Tablet

  const handleCreatorSkip = async () => {
    if (loading) return;
    
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/song/${roomId}/skip`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        onSkip?.();
      }
    } catch (error) {
      console.error('Creator skip error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={!isMobile && (loading ? <CircularProgress size={16} /> : <SkipNextIcon />)}
      onClick={handleCreatorSkip}
      disabled={loading}
      size="small"
      sx={{
        bgcolor: '#f44336',
        color: 'white',
        '&:hover': { 
          bgcolor: '#d32f2f' 
        },
        '&:disabled': {
          backgroundColor: 'rgba(244, 67, 54, 0.3)',
        },
        textTransform: 'none',
        minWidth: isMobile ? '36px' : '120px',
        height: '36px',
        // Mobile/Tablet: Show only icon, no text, no startIcon
        ...(isMobile && {
          padding: '6px',
          '& .MuiButton-startIcon': {
            display: 'none' // Hide startIcon on mobile
          }
        })
      }}
    >
      {isMobile ? (
        loading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : '⏭'
      ) : (
        loading ? 'Skipping...' : 'Skip Song'
      )}
    </Button>
  );
};

export default CreatorSkipButton;