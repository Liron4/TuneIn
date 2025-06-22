import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import axios from 'axios';
import { useSocket } from '../../Context/SocketContext';

const CreatorSkipButton = ({ onSkip }) => {
  const { roomId } = useSocket();
  const [loading, setLoading] = useState(false);

  const handleCreatorSkip = async () => {
    if (loading) return;
    
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/song/${roomId}/skip`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onSkip) onSkip();
    } catch (err) {
      console.error('Error skipping song:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={loading ? <CircularProgress size={20} /> : <SkipNextIcon />}
      onClick={handleCreatorSkip}
      disabled={loading}
      sx={{
        bgcolor: '#f44336',
        '&:hover': { bgcolor: '#d32f2f' },
        minWidth: '120px'
      }}
    >
      {loading ? 'Skipping...' : 'Skip Song'}
    </Button>
  );
};

export default CreatorSkipButton;